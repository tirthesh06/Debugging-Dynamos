import React, { useState } from 'react';
import { Student, ActivitySuggestion } from '../types';
import { generateActivitySuggestions } from '../services/geminiService';
import Spinner from './Spinner';
import AnimatedElement from './AnimatedElement';

interface PersonalizedSuggestionsProps {
  childData: Student;
}

const PersonalizedSuggestions: React.FC<PersonalizedSuggestionsProps> = ({ childData }) => {
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    const result = await generateActivitySuggestions(childData);
    if (result) {
      setSuggestions(result);
    } else {
      setError('Could not generate suggestions at this time. Please try again later.');
    }
    setIsLoading(false);
  };
  
  const getCategoryIcon = (category: ActivitySuggestion['category']) => {
    switch (category) {
      case 'Online Course': return '🎓';
      case 'Workshop': return '🛠️';
      case 'Competition': return '🏆';
      case 'Project Idea': return '💡';
      case 'Reading': return '📚';
      default: return '⭐';
    }
  };

  const renderInitialState = () => (
    <div className="text-center">
      <div className="flex justify-center items-center mb-4">
        <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Unlock Your Child's Potential</h3>
      <p className="text-gray-400 mb-6 max-w-xl mx-auto">
        Get AI-powered suggestions for courses, workshops, and activities tailored to {childData.name}'s academic profile and interests.
      </p>
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
      >
        {isLoading ? 'Analyzing...' : 'Discover Opportunities'}
      </button>
    </div>
  );

  const renderSuggestions = () => (
    <div>
      <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Suggestions for {childData.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions?.map((item, index) => (
          <AnimatedElement key={index} delay={index * 100}>
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 h-full flex flex-col interactive-card">
              <h4 className="text-lg font-bold text-white flex items-start gap-3">
                <span className="text-2xl mt-1">{getCategoryIcon(item.category)}</span>
                <div>
                  {item.title}
                  <span className="block text-xs font-normal text-indigo-400 mt-1">{item.category}</span>
                </div>
              </h4>
              <p className="text-sm text-gray-300 mt-3 flex-grow">{item.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-gray-200">Why this is a good fit:</p>
                <p className="text-sm text-gray-400 italic">"{item.rationale}"</p>
              </div>
            </div>
          </AnimatedElement>
        ))}
      </div>
       <div className="text-center mt-8">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isLoading ? 'Regenerating...' : 'Get New Suggestions'}
            </button>
        </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <Spinner />
          <p className="mt-4 text-gray-300">Finding the best activities for {childData.name}...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
          <p>{error}</p>
           <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg">Try Again</button>
        </div>
      ) : suggestions ? (
        renderSuggestions()
      ) : (
        renderInitialState()
      )}
    </div>
  );
};

export default PersonalizedSuggestions;
