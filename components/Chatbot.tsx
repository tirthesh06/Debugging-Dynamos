

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, UserRole } from '../types';
import { ai, getToolsForRole } from '../services/geminiService';
import Spinner from './Spinner';
import { Chat } from '@google/genai';

interface ChatbotProps {
  context: string;
  userRole: UserRole;
  actions: { [key: string]: (...args: any[]) => Promise<any> };
}

// Make SpeechRecognition available from the browser window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const Chatbot: React.FC<ChatbotProps> = ({ context, userRole, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // States for multi-language and voice features
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);

  // This effect resets the chat session when core properties like language or context change.
  useEffect(() => {
    if (!isOpen) return;

    const languageName = {
        'en-IN': 'English (Indian accent)',
        'hi-IN': 'Hindi',
        'mr-IN': 'Marathi'
    }[selectedLang] || 'English';

    chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful AI assistant for a smart education platform with two modes: Question-Answering and Command-Execution.

1.  **Question-Answering Mode (Default):** If the user asks a question (e.g., "What is my attendance?"), you MUST respond with a text-based answer ONLY. DO NOT use any tools.

2.  **Command-Execution Mode:** You will ONLY use tools if the user gives a direct command. Look for keywords like "click", "open", "navigate", "go to", or "find". For example: "Navigate to the exams tab." or "Find student David."

---
**CRITICAL RULES:**
- NEVER perform an action unless explicitly commanded. If in doubt, just answer the question.
- You MUST reply in the ${languageName} language.
- Current context: ${context}.
- After using a tool, provide a friendly confirmation message.
- Keep responses concise.`,
            tools: getToolsForRole(userRole)
        },
    });
    // Clear UI messages when the session is reset
    setMessages([]);
  }, [userRole, selectedLang, context, isOpen]);

  // Function to speak text using browser's synthesis API
  const speak = useCallback((text: string, lang: string) => {
    if (!isTTSEnabled || !text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }, [isTTSEnabled]);
  
  const handleSendMessage = useCallback(async (text: string) => {
    if (text.trim() === '' || isLoading) return;
    window.speechSynthesis.cancel();

    const userMessage: ChatMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error("Chat not initialized");
      }
      
      let keepProcessing = true;
      // FIX: The type for `sendMessage` requires a `message` property.
      // The type of `messageToSend` is updated to a single object that can contain
      // an optional `toolResponse`.
      let messageToSend: { message: string; toolResponse?: any } = { message: text };

      while (keepProcessing) {
          const result = await chatRef.current.sendMessage(messageToSend);
          
          if (result.functionCalls && result.functionCalls.length > 0) {
              const functionCall = result.functionCalls[0];
              const action = actions[functionCall.name];
              
              let actionResult;
              if (action) {
                  try {
                      setMessages(prev => [...prev, {sender: 'bot', text: `> Executing action: \`${functionCall.name}\`...`}]);
                      actionResult = await action(...Object.values(functionCall.args));
                  } catch (e: any) {
                      actionResult = `Error executing function: ${e.message}`;
                  }
              } else {
                  actionResult = `Error: Function ${functionCall.name} is not available.`;
              }
              
              // FIX: The original code was creating an object that was missing the required `message` property.
              // We now send an empty message along with the tool response to satisfy the API contract.
              messageToSend = {
                  message: '',
                  toolResponse: {
                      functionResponses: {
                          id: functionCall.id,
                          name: functionCall.name,
                          response: { result: actionResult },
                      }
                  }
              };
          } else {
              const botResponseText = result.text;
              if (botResponseText) {
                  setMessages(prev => [...prev, { sender: 'bot', text: botResponseText }]);
                  speak(botResponseText, selectedLang);
              }
              keepProcessing = false;
          }
      }

    } catch (e) {
      console.error("Error sending message to AI:", e);
      const errorMessage = "I'm having trouble connecting to my brain right now. Please try again later.";
      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
      speak(errorMessage, selectedLang);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, actions, speak, selectedLang]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Voice input is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLang;
    
    recognition.onstart = () => {
      setMicError(null);
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setInput(transcript);
      if (event.results[0].isFinal) {
        handleSendMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setMicError("Microphone access is required. Enable it in your browser settings.");
      } else if (event.error === 'network') {
        setMicError("Network error with speech recognition. Please check your connection.");
      } else if (event.error !== 'no-speech') {
        setMicError("An issue occurred with the microphone.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [selectedLang, handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };
  
  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    window.speechSynthesis.cancel();
    setMicError(null);
  };

  const ChatWindow = () => (
    <div className="fixed bottom-24 right-8 w-96 h-[32rem] bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out">
      <header className="p-4 bg-gray-900/50 rounded-t-2xl border-b border-gray-700 flex justify-between items-center">
        <div>
            <h3 className="font-bold text-white text-lg">AI Assistant</h3>
            <div className="flex gap-2 mt-1">
                <button onClick={() => handleLanguageChange('en-IN')} className={`px-2 py-0.5 text-xs rounded ${selectedLang === 'en-IN' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'}`}>English</button>
                <button onClick={() => handleLanguageChange('hi-IN')} className={`px-2 py-0.5 text-xs rounded ${selectedLang === 'hi-IN' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'}`}>हिंदी</button>
                <button onClick={() => handleLanguageChange('mr-IN')} className={`px-2 py-0.5 text-xs rounded ${selectedLang === 'mr-IN' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'}`}>मराठी</button>
            </div>
        </div>
        <button onClick={() => { setIsTTSEnabled(!isTTSEnabled); window.speechSynthesis.cancel(); }} className="text-white" aria-label={isTTSEnabled ? "Mute audio" : "Unmute audio"}>
            {isTTSEnabled ? 
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.74 8.76a.75.75 0 00-1.48-.32L2.55 12.1A.75.75 0 003.2 13h1.05a8.003 8.003 0 0011.5 0h1.05a.75.75 0 00.65-.9l-1.7-3.66a.75.75 0 00-1.48.32L14.45 11h-1.12a6.5 6.5 0 01-7.58 0H4.55L5.74 8.76zM10 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 4z"></path></svg> :
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M12.442 12.442a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM10.25 5.5a.75.75 0 00-1.5 0v2.75a.75.75 0 001.5 0V5.5zM14.28 10a.75.75 0 000-1.5h-2.75a.75.75 0 000 1.5h2.75zM15 13.25a.75.75 0 001.06 1.06l1.06-1.06a.75.75 0 00-1.06-1.06l-1.06 1.06zM7.558 12.442a.75.75 0 01-1.06 0L5.439 11.38a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM8.5 10a.75.75 0 01-.75.75H5a.75.75 0 010-1.5h2.75A.75.75 0 018.5 10zM5.439 8.62a.75.75 0 01-1.06-1.06L5.44 6.5a.75.75 0 011.06 1.06L5.439 8.62zM13.44 6.5a.75.75 0 00-1.06 1.06l1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06z"></path></svg>
            }
        </button>
      </header>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm" style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-700 text-gray-200">
                    <Spinner/>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
        {micError && <p className="text-xs text-red-400 text-center pb-2">{micError}</p>}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
           <button 
                onClick={handleListen}
                disabled={!!micError}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 shrink-0
                    ${!!micError ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : ''}
                    ${isListening ? 'bg-red-600 text-white animate-pulse' : ''}
                    ${!isListening && !micError ? 'bg-gray-600 text-white hover:bg-gray-500' : ''}
                `}
                aria-label={isListening ? "Stop listening" : !!micError ? "Microphone unavailable" : "Start listening"}
            >
                {isLoading && !isListening ? (
                    <Spinner />
                ) : !!micError ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.207 14.621a.5.5 0 01-.707-.707l3.95-3.95a.5.5 0 01.707.707l-3.95 3.95zM7.45 10.379a3 3 0 000 4.243V10.38zM10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path d="M3.793 4.5l12.5 12.5a.5.5 0 01-.707.707l-12.5-12.5a.5.5 0 01.707-.707zM10 4a3 3 0 013 3v.5a.5.5 0 01-1 0V7a2 2 0 00-2-2 2 2 0 00-1.632.793l.879.879A2.002 2.002 0 0110 6.5a2 2 0 012 2v2.5a.5.5 0 01-1 0v-.379l-.879-.879A3.001 3.001 0 0110 4z"></path>
                        <path d="M5.5 8.5A.5.5 0 016 9v1a4 4 0 00.902 2.593l-.879.879A5 5 0 015 10V9a.5.5 0 01.5-.5z"></path>
                        <path d="M15 9.5a.5.5 0 01.5.5v1a5 5 0 01-4.5 4.975V17h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-2.025a5 5 0 01-1.258-1.56L9.65 14.5A4.002 4.002 0 0014 10V9.5a.5.5 0 011 0z"></path>
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z"></path><path d="M5.5 8.5A.5.5 0 016 9v1a4 4 0 004 4 4 4 0 004-4V9a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V17h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-2.025A5 5 0 015 10V9a.5.5 0 01.5-.5z"></path></svg>
                )}
            </button>
          <button onClick={() => handleSendMessage(input)} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && <ChatWindow />}
      <button
        onClick={() => {
            setIsOpen(!isOpen);
            if(isOpen) window.speechSynthesis.cancel(); // Stop speaking if closing
        }}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 z-50"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      </button>
    </>
  );
};

export default Chatbot;
