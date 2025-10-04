import React, { useState } from 'react';
import { Student, Mentor, MentorMatch } from '../types';
import { generateSmartRecommendations } from '../services/geminiService';
import Spinner from './Spinner';

interface MentorSuggestionProps {
  child: Student;
  mentors: Mentor[];
}

const MentorSuggestion: React.FC<MentorSuggestionProps> = ({ child, mentors }) => {
    const [match, setMatch] = useState<MentorMatch | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFindMentor = async () => {
        setIsLoading(true);
        setError(null);
        // We only need the mentor match part of the recommendations
        const result = await generateSmartRecommendations(child, mentors);
        if (result && result.mentorMatch) {
            setMatch(result.mentorMatch);
        } else {
            setError('Could not find a suitable mentor at this time. Please try again later.');
        }
        setIsLoading(false);
    };

    const matchedMentor = match ? mentors.find(m => m.id === match.mentorId) : null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Spinner />
                <span className="ml-4 text-gray-300">AI is finding the best mentor match...</span>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">{error}</div>
    }

    if (matchedMentor) {
        return (
             <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-900/50 p-6 rounded-xl border border-indigo-500/30">
                <img src={matchedMentor.imageUrl} alt={matchedMentor.name} className="w-24 h-24 rounded-full border-2 border-indigo-500" />
                <div className="text-center sm:text-left">
                    <p className="text-sm text-indigo-400 font-semibold">AI Recommended Mentor</p>
                    <h4 className="text-xl font-bold text-white">{matchedMentor.name}</h4>
                    <p className="text-sm text-gray-400 font-medium">{matchedMentor.expertise.join(' • ')}</p>
                    <p className="text-sm text-gray-300 mt-2 italic">"{match?.reasoning}"</p>
                </div>
            </div>
        )
    }

    return (
        <div className="text-center">
            <button onClick={handleFindMentor} className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Find a Mentor for {child.name}
            </button>
        </div>
    );
};

export default MentorSuggestion;
