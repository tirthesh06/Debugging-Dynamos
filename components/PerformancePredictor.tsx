import React, { useState } from 'react';
import { Student, PerformancePrediction } from '../types';
import { predictStudentPerformance } from '../services/geminiService';
import Spinner from './Spinner';

interface PerformancePredictorProps {
  student: Student;
}

const PerformancePredictor: React.FC<PerformancePredictorProps> = ({ student }) => {
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    const result = await predictStudentPerformance(student);
    if (result) {
      setPrediction(result);
    } else {
      setError('Could not generate a prediction. The AI service might be unavailable. Please try again later.');
    }
    setIsLoading(false);
  };

  const getConfidenceChipClass = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-green-600/50 text-green-200 border border-green-500/50';
      case 'medium':
        return 'bg-yellow-600/50 text-yellow-200 border border-yellow-500/50';
      case 'low':
        return 'bg-red-600/50 text-red-200 border border-red-500/50';
      default:
        return 'bg-gray-600/50 text-gray-200 border border-gray-500/50';
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h3 className="text-xl font-bold text-indigo-400 mb-4">AI Performance Prediction</h3>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[150px]">
          <Spinner />
          <p className="mt-4 text-gray-300">Analyzing academic data...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
          <p>{error}</p>
        </div>
      ) : prediction ? (
        <div className="text-center">
            <div className="mb-4">
                <p className="text-sm text-gray-400">Predicted Exam Performance</p>
                <p className="text-4xl font-bold text-white tracking-tight my-1">{prediction.predicted_performance}</p>
                <div className="flex justify-center items-center gap-2">
                    <p className="text-sm text-gray-400">Confidence:</p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConfidenceChipClass(prediction.confidence_score)}`}>
                        {prediction.confidence_score}
                    </span>
                </div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm font-semibold text-gray-200">Rationale:</p>
                <p className="text-gray-300 italic">"{prediction.rationale}"</p>
            </div>
             <button
              onClick={handlePredict}
              className="mt-6 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Re-analyze Performance
            </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Get an AI-powered forecast of your likely exam performance based on your attendance patterns and study plan.
          </p>
          <button
            onClick={handlePredict}
            className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
          >
            Analyze & Predict Performance
          </button>
        </div>
      )}
    </div>
  );
};

export default PerformancePredictor;