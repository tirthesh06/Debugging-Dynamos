import React, { useState } from 'react';
import { generatePersonalizedLearningPath } from '../services/geminiService';
import Spinner from './Spinner';
import { Student, LearningPath } from '../types';

interface LearningPathGeneratorProps {
  student: Student;
  onPlanGenerated: (learningPath: LearningPath) => void;
}

const LearningPathGenerator: React.FC<LearningPathGeneratorProps> = ({ student, onPlanGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    const path = await generatePersonalizedLearningPath(student);
    if (path) {
      onPlanGenerated(path);
    } else {
      setError("Failed to generate a learning path. The AI service may be unavailable. Please try again later.");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mt-6">
      <h3 className="text-2xl font-bold mb-4 text-indigo-400">AI-Powered Learning Path</h3>
      
      {!student.learningPath && (
        <p className="text-gray-400 mb-4">
          Analyze {student.name}'s attendance data to generate a personalized weekly study plan.
        </p>
      )}

      {error && <p className="text-red-400 my-4 text-center">{error}</p>}
      
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full md:w-1/2 flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-800"
        >
          {isLoading ? (
            <>
              <Spinner /> <span className="ml-2">Generating...</span>
            </>
          ) : student.learningPath ? (
            'Regenerate Plan'
          ) : (
            'Generate Personalized Plan'
          )}
        </button>
      </div>
       {student.learningPath && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          A plan already exists. Clicking will generate a new one.
        </p>
      )}
    </div>
  );
};

export default LearningPathGenerator;