import React from 'react';
import { LearningPath } from '../types';

interface LearningPathViewProps {
  learningPath: LearningPath;
}

const LearningPathView: React.FC<LearningPathViewProps> = ({ learningPath }) => {
  if (!learningPath) return null;
  
  const iconMap: { [key: string]: string } = {
    Monday: '📅',
    Tuesday: '📚',
    Wednesday: '✏️',
    Thursday: '💡',
    Friday: '🎯',
    Saturday: '⭐',
    Sunday: '🧘',
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-2 text-indigo-400">Your AI-Generated Weekly Plan</h2>
      <p className="text-gray-300 mb-6 italic">"{learningPath.overall_summary}"</p>

      <div className="space-y-4">
        {learningPath.daily_plan.map((day, index) => (
          <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 transition-all duration-300 hover:border-indigo-500 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-xl">{iconMap[day.day] || '🗓️'}</span>
                {day.day}: <span className="text-indigo-400">{day.focus_topic}</span>
            </h3>
            <p className="text-sm text-gray-400 ml-8 mb-2">Estimated Time: {day.estimated_time}</p>
            <div className="ml-8 pl-4 border-l-2 border-gray-600 space-y-2">
                <div>
                    <p className="font-semibold text-gray-200">Learning Activity:</p>
                    <p className="text-gray-300">{day.learning_activity}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-200">Practice Task:</p>
                    <p className="text-gray-300">{day.practice_task}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathView;