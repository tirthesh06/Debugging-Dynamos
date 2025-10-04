import React, { useState } from 'react';
import { Student, ParentSummary } from '../types';
import { generateParentSummary } from '../services/geminiService';
import Spinner from './Spinner';
import AnimatedElement from './AnimatedElement';

interface AIParentSummaryProps {
  student: Student;
}

const AIParentSummary: React.FC<AIParentSummaryProps> = ({ student }) => {
  const [summary, setSummary] = useState<ParentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    const result = await generateParentSummary(student);
    if (result) {
      setSummary(result);
    } else {
      setError('Could not generate a summary at this time. Please try again later.');
    }
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <Spinner />
          <p className="mt-4 text-gray-300">Generating AI-powered summary...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
          <p>{error}</p>
          <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg">Try Again</button>
        </div>
      );
    }

    if (summary) {
      return (
        <AnimatedElement>
          <p className="text-lg text-gray-300 italic text-center mb-6">"{summary.overall_summary}"</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-green-500/30">
              <h4 className="font-semibold text-green-400 mb-2 text-lg">Key Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {summary.key_strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/30">
              <h4 className="font-semibold text-yellow-400 mb-2 text-lg">Areas to Watch</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {summary.areas_to_watch.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
          <div className="text-center mt-6">
            <button onClick={handleGenerate} disabled={isLoading} className="text-sm text-indigo-400 hover:underline">
              {isLoading ? 'Refreshing...' : 'Refresh Summary'}
            </button>
          </div>
        </AnimatedElement>
      );
    }

    return (
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          Generate AI Summary
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-indigo-400 mb-4 text-center">AI Academic Snapshot</h2>
      <p className="text-gray-400 mb-6 text-center max-w-2xl mx-auto">
        Get a quick, AI-generated overview of {student.name}'s current progress, highlighting achievements and areas that may need extra attention.
      </p>
      {renderContent()}
    </div>
  );
};

export default AIParentSummary;
