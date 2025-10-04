import React, { useState } from 'react';
import { Student, LearningStrategy } from '../types';
import { predictLearningStrategies } from '../services/geminiService';
import Spinner from './Spinner';
import AnimatedElement from './AnimatedElement';

interface LearningStrategiesProps {
  student: Student;
}

const LearningStrategies: React.FC<LearningStrategiesProps> = ({ student }) => {
  const [strategies, setStrategies] = useState<LearningStrategy[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (student.progress.length === 0) {
      setError("Cannot generate strategies without academic progress data.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await predictLearningStrategies(student);
    if (result) {
      setStrategies(result);
    } else {
      setError('Could not predict learning strategies at this time. Please try again later.');
    }
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <Spinner />
          <p className="mt-4 text-gray-300">Predicting best learning strategies...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
          <p>{error}</p>
          {student.progress.length > 0 && 
            <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg">Try Again</button>
          }
        </div>
      );
    }

    if (strategies) {
      return (
        <div className="space-y-4">
          {strategies.map((strategy, index) => (
            <AnimatedElement key={index} delay={index * 100}>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-white text-lg">{strategy.strategy_name}</h4>
                <p className="text-gray-300 mt-1">{strategy.description}</p>
                <p className="text-sm text-indigo-300 mt-2 italic">
                  <strong>Why it might help:</strong> {strategy.reasoning}
                </p>
              </div>
            </AnimatedElement>
          ))}
           <div className="text-center mt-6">
            <button onClick={handleGenerate} disabled={isLoading} className="text-sm text-indigo-400 hover:underline">
              {isLoading ? 'Re-analyzing...' : 'Suggest New Strategies'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isLoading || student.progress.length === 0}
          className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
          title={student.progress.length === 0 ? "Requires student progress data" : ""}
        >
          Predict Learning Strategies
        </button>
         {student.progress.length === 0 &&
            <p className="text-xs text-gray-500 mt-2">This feature is enabled once your child has academic progress data.</p>
         }
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-indigo-400 mb-4 text-center">AI-Powered Learning Strategies</h2>
      <p className="text-gray-400 mb-6 text-center max-w-2xl mx-auto">
        Discover the most effective study techniques for {student.name}, predicted by AI based on their unique academic patterns.
      </p>
      {renderContent()}
    </div>
  );
};

export default LearningStrategies;
