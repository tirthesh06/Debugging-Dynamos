import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Student, User, EngagementStatus, EngagementAlert, EngagementActivitySuggestion } from '../types';
import StudentCameraTile from './StudentCameraTile';
import { analyzeStudentEngagement, suggestEngagementActivity } from '../services/geminiService';
import Spinner from './Spinner';
import AnimatedElement from './AnimatedElement';

interface LiveClassViewProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  subject: string;
  teacher: User;
}

const LiveClassView: React.FC<LiveClassViewProps> = ({ students, setStudents, subject, teacher }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<EngagementAlert[]>([]);
  const [suggestions, setSuggestions] = useState<EngagementActivitySuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Click "Start Monitoring" to begin the session.');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // For this demo, we'll monitor the teacher's camera as if it were the first student's.
  const studentToMonitor = students[0];

  const stopMonitoring = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setIsMonitoring(false);
    setStatusMessage('Monitoring stopped. Click "Start Monitoring" to resume.');
    // Reset all student statuses to Unknown
    setStudents(students.map(s => ({ ...s, engagementStatus: EngagementStatus.Unknown })));
  }, [students, setStudents]);


  const startMonitoring = useCallback(async () => {
    if (!studentToMonitor) {
        setError("No students available to monitor.");
        return;
    }

    setIsMonitoring(true);
    setError(null);
    setStatusMessage('Initializing camera...');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        setStatusMessage('Monitoring session active...');

        intervalId.current = window.setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Match canvas size to video stream size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

            const result = await analyzeStudentEngagement(imageBase64);
            
            if (result) {
                // FIX: The `setStudents` prop is incorrectly typed as a simple function.
                // We cast it to a React Dispatcher to allow a functional update, which is
                // necessary to prevent stale state within the setInterval closure.
                (setStudents as React.Dispatch<React.SetStateAction<Student[]>>)(prevStudents => prevStudents.map(s => 
                    s.id === studentToMonitor.id ? { ...s, engagementStatus: result.engagement_level } : s
                ));

                if (result.engagement_level === EngagementStatus.Disengaged) {
                    const newAlert: EngagementAlert = {
                        studentId: studentToMonitor.id,
                        studentName: studentToMonitor.name,
                        message: result.reasoning,
                        timestamp: Date.now()
                    };
                    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
                    
                    // Fetch new activity suggestions
                    const activitySuggestions = await suggestEngagementActivity(subject, result.reasoning);
                    if (activitySuggestions) {
                        setSuggestions(activitySuggestions);
                    }
                }
            }
        }, 10000); // Analyze every 10 seconds

    } catch (err) {
        console.error("Camera Error:", err);
        setError("Could not access camera. Please check permissions and ensure it's not in use.");
        stopMonitoring();
    }
  }, [studentToMonitor, setStudents, subject, stopMonitoring]);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
        stopMonitoring();
    };
  }, [stopMonitoring]);

  return (
    <div className="space-y-6">
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-indigo-400">Live Class Engagement</h2>
                    <p className="text-sm text-gray-400">{statusMessage}</p>
                </div>
                <button 
                    onClick={isMonitoring ? stopMonitoring : startMonitoring}
                    className={`px-6 py-2 font-semibold text-white rounded-lg flex items-center gap-2 transition-colors ${isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isMonitoring ? (
                        <>
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                         Stop Monitoring
                        </>
                    ) : (
                       <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
                        Start Monitoring
                       </>
                    )}
                </button>
            </div>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {students.map((student, index) => (
                        <StudentCameraTile 
                            key={student.id} 
                            student={student} 
                            isLiveFeed={index === 0} // First student is the one we monitor
                            videoRef={index === 0 ? videoRef : undefined}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <AnimatedElement className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <h3 className="font-semibold text-white mb-3">Engagement Alerts</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {alerts.length > 0 ? alerts.map(alert => (
                            <div key={alert.timestamp} className="p-2 bg-red-900/50 border-l-4 border-red-500 rounded">
                                <p className="font-semibold text-red-300 text-sm">{alert.studentName} seems disengaged.</p>
                                <p className="text-xs text-red-400 italic">"{alert.message}"</p>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">No alerts yet.</p>}
                    </div>
                </AnimatedElement>

                <AnimatedElement className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                     <h3 className="font-semibold text-white mb-3">AI Activity Suggestions</h3>
                     <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                         {suggestions.length > 0 ? suggestions.map(sugg => (
                            <div key={sugg.title} className="p-2 bg-gray-900/50 border-l-4 border-indigo-500 rounded">
                                <p className="font-semibold text-indigo-300 text-sm">{sugg.title} ({sugg.type})</p>
                                <p className="text-xs text-gray-300">{sugg.description}</p>
                            </div>
                         )) : <p className="text-sm text-gray-500 text-center py-4">Suggestions will appear here if students are disengaged.</p>}
                     </div>
                </AnimatedElement>
            </div>
        </div>
    </div>
  );
};

export default LiveClassView;
