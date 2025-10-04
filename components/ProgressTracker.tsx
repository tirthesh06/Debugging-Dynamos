import React, { useState, useEffect, useMemo } from 'react';
import { Student, ProgressInsight, AssignmentStatus, Assignment } from '../types';
import { generateProgressInsights } from '../services/geminiService';
import Spinner from './Spinner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import AnimatedElement from './AnimatedElement';

interface ProgressTrackerProps {
  student: Student;
}

const AIInsights: React.FC<{ student: Student }> = ({ student }) => {
    const [insights, setInsights] = useState<ProgressInsight | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await generateProgressInsights(student.progress, student.name);
                if (result) {
                    setInsights(result);
                } else {
                    setError('Could not fetch AI insights. Please try again later.');
                }
            } catch (e) {
                setError('An error occurred while fetching insights.');
            } finally {
                setIsLoading(false);
            }
        };

        if (student.progress.length > 0) {
            fetchInsights();
        } else {
            setIsLoading(false);
        }
    }, [student.progress, student.name]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 bg-gray-900/50 rounded-lg border border-gray-700">
                <Spinner />
                <span className="ml-4 text-gray-300">Generating AI-powered insights...</span>
            </div>
        );
    }
    
    if (error) {
         return <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">{error}</div>
    }

    if (!insights) {
        return null; // Don't show the card if there are no insights (e.g., no progress data)
    }

    return (
        <div className="p-6 bg-gray-900/50 rounded-xl border border-indigo-500/30">
            <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Your AI Academic Coach
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                        {insights.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Areas to Focus On</h4>
                     <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                        {insights.areas_for_improvement.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-cyan-400 mb-2">Actionable Advice</h4>
                    <p className="text-gray-300 text-sm italic">"{insights.actionable_advice}"</p>
                </div>
            </div>
        </div>
    );
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ student }) => {

    const getStatusChipClass = (status: AssignmentStatus) => {
        switch (status) {
            case AssignmentStatus.Graded: return 'bg-green-600/50 text-green-200';
            case AssignmentStatus.Submitted: return 'bg-blue-600/50 text-blue-200';
            case AssignmentStatus.Pending: return 'bg-yellow-600/50 text-yellow-200';
            case AssignmentStatus.Late: return 'bg-red-600/50 text-red-200';
            default: return 'bg-gray-600/50 text-gray-200';
        }
    };
    
    const chartData = (assignments: Assignment[]) => {
        return assignments
            .filter(a => a.status === AssignmentStatus.Graded && a.score !== undefined)
            .slice(-5) // get last 5 graded assignments
            .map(a => ({
                name: a.title.split(' ').slice(0, 2).join(' ').replace(/:$/, ''), // Improved name shortening
                score: a.score,
                maxScore: a.maxScore,
                percentage: (a.score! / a.maxScore) * 100,
            }));
    };

    if (student.progress.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="text-2xl font-bold text-white">No Progress Data Available</h3>
              <p className="text-gray-300 mt-2 max-w-xl mx-auto">
                Your academic progress, including grades and assignment statuses, will appear here once your teacher adds them.
              </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Academic Progress Tracker</h2>
            <AnimatedElement>
                <AIInsights student={student} />
            </AnimatedElement>
            
            <div className="space-y-6">
                {student.progress.map((subject, index) => {
                    const subjectChartData = chartData(subject.assignments);
                    return (
                        <AnimatedElement key={subject.subjectName} delay={100 * (index + 1)}>
                            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{subject.subjectName}</h3>
                                        <p className="text-gray-400 italic">"{subject.teacherFeedback}"</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Overall Grade</p>
                                        <p className="text-4xl font-bold text-indigo-400">{subject.overallGrade}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <h4 className="font-semibold text-gray-300 mb-2">Recent Scores</h4>
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={subjectChartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                                                    <XAxis dataKey="name" fontSize={10} tick={{ fill: '#9ca3af' }} interval={0} />
                                                    <YAxis fontSize={12} tick={{ fill: '#9ca3af' }} domain={[0, 100]} unit="%" />
                                                    <Tooltip
                                                      cursor={{ fill: 'rgba(129, 140, 248, 0.1)' }}
                                                      contentStyle={{
                                                          background: '#1f2937',
                                                          border: '1px solid #4b5563',
                                                          borderRadius: '0.5rem',
                                                      }}
                                                      labelStyle={{ color: '#d1d5db' }}
                                                      formatter={(value: number, name, props) => [`${props.payload.score}/${props.payload.maxScore} (${value.toFixed(1)}%)`, 'Score']}
                                                    />
                                                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                                                       {subjectChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.percentage >= 80 ? '#4ade80' : entry.percentage >= 60 ? '#facc15' : '#f87171'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <h4 className="font-semibold text-gray-300 mb-2">Assignments</h4>
                                        <div className="overflow-x-auto max-h-48 pr-2">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-600">
                                                        <th className="py-2">Title</th>
                                                        <th className="py-2 text-center">Status</th>
                                                        <th className="py-2 text-right">Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subject.assignments.map(ass => (
                                                        <tr key={ass.id} className="border-b border-gray-700/50">
                                                            <td className="py-2 text-white">{ass.title}</td>
                                                            <td className="py-2 text-center">
                                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusChipClass(ass.status)}`}>
                                                                    {ass.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 text-right text-gray-300">
                                                                {ass.score !== undefined ? `${ass.score} / ${ass.maxScore}` : '—'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedElement>
                    )
                })}
            </div>
        </div>
    );
};

export default ProgressTracker;