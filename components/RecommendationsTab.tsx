import React, { useState } from 'react';
import { Student, Mentor, SmartRecommendations } from '../types';
import { generateSmartRecommendations } from '../services/geminiService';
import Spinner from './Spinner';
import AnimatedElement from './AnimatedElement';

interface RecommendationsTabProps {
  student: Student;
  mentors: Mentor[];
}

const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ student, mentors }) => {
  const [recommendations, setRecommendations] = useState<SmartRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    const result = await generateSmartRecommendations(student, mentors);
    if (result) {
      setRecommendations(result);
    } else {
      setError('Could not generate recommendations at this time. Please try again later.');
    }
    setIsLoading(false);
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return '🎬';
      case 'article': return '📰';
      case 'book': return '📚';
      case 'course': return '🎓';
      default: return '🔗';
    }
  };

  const matchedMentor = recommendations ? mentors.find(m => m.id === recommendations.mentorMatch.mentorId) : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <Spinner />
        <p className="mt-4 text-lg text-gray-300">AI is analyzing your profile...</p>
        <p className="text-gray-400">Finding the best resources, career paths, and mentors for you!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-900/30 rounded-xl border border-red-500/50">
        <h3 className="text-2xl font-bold text-red-300">Something went wrong</h3>
        <p className="text-red-300/80 mt-2 max-w-md mx-auto">{error}</p>
        <button onClick={handleGenerate} className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700">
          Try Again
        </button>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
        <h2 className="text-3xl font-bold text-white">Unlock Your Personalized Recommendations</h2>
        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          Get AI-powered recommendations for learning resources, career paths, and even a personal mentor, all based on your unique academic profile.
        </p>
        <button 
          onClick={handleGenerate}
          className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          ✨ Generate My Smart Recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <AnimatedElement>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-indigo-400 mb-4">Your AI Mentor Match</h3>
                {matchedMentor ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-900/50 p-4 rounded-lg">
                        <img src={matchedMentor.imageUrl} alt={matchedMentor.name} className="w-24 h-24 rounded-full border-2 border-indigo-500" />
                        <div className="text-center sm:text-left">
                            <h4 className="text-xl font-bold text-white">{matchedMentor.name}</h4>
                            <p className="text-sm text-gray-400 font-medium">{matchedMentor.expertise.join(' • ')}</p>
                            <p className="text-sm text-gray-300 mt-2 italic">"{recommendations.mentorMatch.reasoning}"</p>
                            <button className="mt-4 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700">Connect with {matchedMentor.name.split(' ')[0]}</button>
                        </div>
                    </div>
                ) : <p className="text-gray-400">Could not find a suitable mentor at this time.</p>}
            </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatedElement delay={100}>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 h-full">
                    <h3 className="text-2xl font-bold text-indigo-400 mb-4">Career & Skill Guidance</h3>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Suggested Path</p>
                        <h4 className="text-2xl font-bold text-white">{recommendations.career.path}</h4>
                        <p className="text-sm text-gray-300 mt-2 italic">"{recommendations.career.reasoning}"</p>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <h5 className="font-semibold text-gray-200 mb-2">Key Skills to Develop:</h5>
                            <div className="flex flex-wrap gap-2">
                                {recommendations.career.skills_to_develop.map(skill => (
                                    <span key={skill} className="px-3 py-1 text-xs font-medium bg-gray-700 text-gray-200 rounded-full">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedElement>

            <AnimatedElement delay={200}>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 h-full">
                    <h3 className="text-2xl font-bold text-indigo-400 mb-4">Recommended Learning Resources</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {recommendations.resources.map((res, index) => (
                            <a href={res.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-indigo-500 transition-colors">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl mt-1">{getResourceTypeIcon(res.type)}</span>
                                    <div>
                                        <p className="font-semibold text-white">{res.title}</p>
                                        <p className="text-xs text-gray-400">{res.description}</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </AnimatedElement>
        </div>
    </div>
  );
};

export default RecommendationsTab;
