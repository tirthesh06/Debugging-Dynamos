import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exam, Question } from '../types';

interface ExamTakerProps {
  exam: Exam;
  onClose: () => void;
  onSubmit: (answers: { [questionId: string]: string }, status: 'Completed' | 'Blocked') => void;
}

const ExamTaker: React.FC<ExamTakerProps> = ({ exam, onClose, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [warnings, setWarnings] = useState(0);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Use a ref for answers and warnings to prevent stale closures in callbacks
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const warningsRef = useRef(warnings);
  useEffect(() => { warningsRef.current = warnings; }, [warnings]);

  // Anti-cheating visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.hidden) {
            // Ignore visibility change if modals are open or exam is already blocked
            if (isWarningVisible || isBlocked) return;

            const newWarningCount = warningsRef.current + 1;
            warningsRef.current = newWarningCount;
            setWarnings(newWarningCount);

            if (newWarningCount === 1) {
                setIsWarningVisible(true);
            } else if (newWarningCount >= 2) {
                setIsBlocked(true);
                // Force submit the exam with a 'Blocked' status
                onSubmit(answersRef.current, 'Blocked');
            }
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWarningVisible, isBlocked, onSubmit]);


  // Memoize the submit callback
  const handleFinalSubmit = useCallback((status: 'Completed' | 'Blocked' = 'Completed') => {
    onSubmit(answersRef.current, status);
  }, [onSubmit]);

  // Start a stable interval timer when the component mounts
  useEffect(() => {
    if (timeLeft <= 0 || isBlocked) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isBlocked, timeLeft]);

  // Watch for when the timer reaches zero to trigger submission
  useEffect(() => {
    if (timeLeft === 0 && !isBlocked) {
      handleFinalSubmit('Completed');
    }
  }, [timeLeft, handleFinalSubmit, isBlocked]);


  const handleManualSubmit = () => {
    if (window.confirm('Are you sure you want to submit your answers? This action cannot be undone.')) {
      handleFinalSubmit('Completed');
    }
  };
  
  const handleClose = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will not be saved.')) {
        onClose();
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Renders a modal for the first cheating warning
  const WarningModal = () => (
     <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl border border-yellow-500/50">
            <h2 className="text-3xl font-bold text-yellow-300 mb-4">Warning!</h2>
            <p className="text-gray-200 text-lg">You have navigated away from the exam tab. This is your first and final warning.</p>
            <p className="text-red-400 font-semibold mt-4">If this happens again, your exam will be automatically submitted and blocked.</p>
            <button onClick={() => setIsWarningVisible(false)} className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                I Understand, Return to Exam
            </button>
        </div>
    </div>
  );

  // Renders an overlay when the exam is blocked
  const BlockedOverlay = () => (
     <div className="absolute inset-0 bg-gray-900/95 z-10 flex items-center justify-center p-4 text-center">
         <div>
            <h1 className="text-3xl font-bold text-red-400">Exam Blocked</h1>
            <p className="text-lg text-gray-300 mt-2">Your exam has been automatically submitted due to a violation of the rules (navigating away from the exam tab).
            </p>
            <p className="text-gray-400 mt-4">Please contact your teacher for further instructions.</p>
         </div>
     </div>
  );

  // BUG FIX: Use Array.isArray to prevent crash if exam.questions is malformed (e.g., an object instead of an array).
  if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4 text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-400">Exam Error</h1>
                <p className="text-gray-300 mt-2">This exam has no questions and cannot be taken.</p>
                <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Go Back</button>
            </div>
        </div>
    );
  }

  const currentQuestion: Question = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  
  return (
    <div 
        className="fixed inset-0 bg-gray-900 z-50 grid grid-rows-[auto_1fr_auto] p-4 sm:p-8 text-white"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
    >
      {isWarningVisible && <WarningModal />}
      
      <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-gray-400">{exam.subject}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                {formatTime(timeLeft)}
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white" aria-label="Close exam">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </header>
      
      <main className="overflow-y-auto relative">
        {isBlocked && <BlockedOverlay />}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Question {currentQuestionIndex + 1} of {exam.questions.length}</h2>
            <p className="text-lg text-white mb-6 min-h-[56px] select-none">{currentQuestion.text}</p>
            <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                    <label key={idx} className={`flex items-center p-4 bg-gray-900/50 rounded-lg border-2 hover:border-indigo-500 cursor-pointer transition-colors ${answers[currentQuestion.id] === option ? 'border-indigo-500' : 'border-gray-700'}`}>
                        <input
                            type="radio"
                            name={currentQuestion.id}
                            value={option}
                            checked={answers[currentQuestion.id] === option}
                            onChange={() => handleSelectAnswer(currentQuestion.id, option)}
                            className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                            disabled={isBlocked}
                        />
                        <span className="ml-4 text-gray-200 select-none">{option}</span>
                    </label>
                ))}
            </div>
        </div>
      </main>
      
      <footer className="mt-6 flex justify-between items-center">
        <div>
            <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0 || isBlocked}
                className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
                Previous
            </button>
            <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === exam.questions.length - 1 || isBlocked}
                className="ml-4 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
                Next
            </button>
        </div>
        <button
            onClick={handleManualSubmit}
            disabled={isBlocked}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Submit Exam
        </button>
      </footer>
    </div>
  );
};

export default ExamTaker;