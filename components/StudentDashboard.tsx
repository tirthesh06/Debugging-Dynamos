
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User, Student, LearningPath, LeaveApplication, Exam, ExamSubmission, UserRole } from '../types';
import Header from './Header';
import Chatbot from './Chatbot';
import RollAccountView from './RollAccountView';
import StudentLearningPlanner from './StudentLearningPlanner';
import FileManager from './FileManager';
import AttendanceCheckinFlow from './AttendanceCheckinFlow';
import PerformancePredictor from './PerformancePredictor';
import SharedLinksView from './SharedLinksView';
import AnimatedElement from './AnimatedElement';
import ProgressTracker from './ProgressTracker';
import { isWithinGeofence } from '../utils/geolocation';
import Spinner from './Spinner';
import AccountSettings from './AccountSettings';
import LeaveApplicationManager from './LeaveApplicationManager';
import ExamPortal from './ExamPortal';
import RecommendationsTab from './RecommendationsTab';
import { MOCK_MENTORS } from '../data/mockData';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  studentData: Student;
  onPlanUpdate: (learningPath: LearningPath) => void;
  onUpdateUser: (user: User) => void;
  leaveApplications: LeaveApplication[];
  onApplyForLeave: (applicationData: Omit<LeaveApplication, 'id' | 'status' | 'applicationDate'>) => void;
  exams: Exam[];
  examSubmissions: ExamSubmission[];
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'score' | 'studentName'>) => void;
}

type ReadinessStatus = 'idle' | 'checking' | 'ready' | 'geofence_fail' | 'permission_fail' | 'error';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, studentData, onPlanUpdate, onUpdateUser, leaveApplications, onApplyForLeave, exams, examSubmissions, onSubmitExam }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCheckinFlowOpen, setIsCheckinFlowOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // New states for the "Ready for Class" feature
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>('idle');
  const [readinessMessage, setReadinessMessage] = useState('Verify your location to enable attendance check-in.');
  const [verifiedLocation, setVerifiedLocation] = useState<GeolocationCoordinates | null>(null);

  const totalClasses = studentData.attendance.length;
  const presentClasses = studentData.attendance.filter(a => a.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

  const handleLocationCheck = useCallback(() => {
    setReadinessStatus('checking');
    setReadinessMessage('Getting your location... Please wait.');
    setVerifiedLocation(null);

    if (!navigator.geolocation) {
      setReadinessStatus('error');
      setReadinessMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User location:", position.coords);
        if (isWithinGeofence(position.coords)) {
          setReadinessStatus('ready');
          setReadinessMessage('Location Verified! You are inside the campus.');
          setVerifiedLocation(position.coords);
        } else {
          setReadinessStatus('geofence_fail');
          setReadinessMessage('You seem to be outside the campus boundary. Please move inside and try again.');
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let userMessage = 'Could not get your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setReadinessStatus('permission_fail');
            userMessage += "Please enable location permissions for this site in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            setReadinessStatus('error');
            userMessage += "Location information is unavailable. Try connecting to a different network.";
            break;
          case error.TIMEOUT:
            setReadinessStatus('error');
            userMessage += "The request timed out. Please check your internet connection and try again.";
            break;
          default:
            setReadinessStatus('error');
            userMessage += "An unknown error occurred.";
            break;
        }
        setReadinessMessage(userMessage);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      handleLocationCheck();
    } else {
      // FIX: Ensure the check-in flow (and face scan) is closed when navigating away from the overview tab.
      setIsCheckinFlowOpen(false);
    }
  }, [activeTab, handleLocationCheck]);


  const chatbotContext = useMemo(() => {
    let context = `User is a student named ${user.name}. They are viewing their ${activeTab} tab.`;

    if (studentData.learningPath) {
      const planString = studentData.learningPath.daily_plan
        .map(day => `- ${day.day}: ${day.focus_topic} (${day.learning_activity})`)
        .join('\n');
      
      context += `\n\nHere is the student's current learning plan:\nSummary: "${studentData.learningPath.overall_summary}"\nSchedule:\n${planString}`;
    } else {
      context += ' The student does not have an active AI-generated learning plan yet.';
    }
    
    return context;
  }, [user.name, activeTab, studentData.learningPath]);

  const chatbotActions = useMemo(() => ({
    navigate_to_tab: async (tab: string) => {
        const validTabs = ['overview', 'progress', 'attendance', 'leave', 'learning', 'exams', 'files', 'links', 'recommendations'];
        const lowerTab = tab.toLowerCase().replace(/\s+/g, '');

        if (validTabs.includes(lowerTab)) {
            setActiveTab(lowerTab);
            return `OK. Navigated to the ${tab} tab.`;
        }
        return `Sorry, I can't find a tab called "${tab}". Please choose from: ${validTabs.join(', ')}.`;
    }
  }), []);
  
  const ReadinessStatusIcon: React.FC = () => {
    switch (readinessStatus) {
        case 'checking': return <Spinner />;
        case 'ready': return <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'geofence_fail':
        case 'permission_fail':
        case 'error':
             return <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default:
             return <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    }
  };

  const getReadinessMessageColor = () => {
     switch (readinessStatus) {
        case 'ready': return 'text-green-300';
        case 'geofence_fail':
        case 'permission_fail':
        case 'error': return 'text-red-300';
        default: return 'text-gray-400';
     }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedElement>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 interactive-card">
                  <h3 className="text-lg font-semibold text-indigo-400">Attendance Summary</h3>
                  <p className="text-4xl font-bold mt-2">{attendancePercentage.toFixed(1)}%</p>
                  <p className="text-gray-400">{presentClasses} / {totalClasses} classes attended</p>
                </div>
              </AnimatedElement>
              <AnimatedElement delay={100}>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center interactive-card text-center min-h-[290px]">
                  <ReadinessStatusIcon />
                  <h3 className="text-xl font-bold text-white mt-4 mb-2">Ready for Class?</h3>
                  <p className={`mb-4 text-sm min-h-[40px] ${getReadinessMessageColor()}`}>{readinessMessage}</p>
                  
                  {readinessStatus !== 'ready' && (
                    <>
                        <button
                          onClick={handleLocationCheck}
                          disabled={readinessStatus === 'checking'}
                          className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-indigo-800 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center w-full max-w-xs"
                        >
                          {readinessStatus === 'checking' ? 'Checking...' : "I'm on Campus, Check My Location"}
                        </button>
                        <div className="mt-4 text-xs text-gray-500 max-w-xs">
                            <strong>Tips:</strong> For best results, connect to campus Wi-Fi and enable high-accuracy location.
                        </div>
                    </>
                  )}
                </div>
              </AnimatedElement>
            </div>
             {readinessStatus === 'ready' && (
                 <AnimatedElement delay={200} className="mt-6">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-green-500/50 flex flex-col items-center justify-center interactive-card">
                        <svg className="w-16 h-16 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h3 className="text-xl font-bold text-white mb-2">You're All Set!</h3>
                        <p className="text-gray-400 mb-4 text-center text-sm">Your on-campus location is verified. Proceed to mark your attendance.</p>
                        <button 
                          onClick={() => setIsCheckinFlowOpen(true)}
                          className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                        >
                          Mark My Attendance
                        </button>
                    </div>
                </AnimatedElement>
            )}
            <AnimatedElement delay={readinessStatus === 'ready' ? 300 : 200} className="mt-6">
              <PerformancePredictor student={studentData} />
            </AnimatedElement>
          </div>
        );
      case 'progress':
        return <AnimatedElement><ProgressTracker student={studentData} /></AnimatedElement>;
      case 'attendance':
        return <AnimatedElement><RollAccountView attendance={studentData.attendance} /></AnimatedElement>;
      case 'leave':
        return <AnimatedElement><LeaveApplicationManager 
            student={studentData}
            applications={leaveApplications}
            onApplyForLeave={onApplyForLeave}
        /></AnimatedElement>;
      case 'learning':
        return <AnimatedElement><StudentLearningPlanner 
            student={studentData} 
            onPlanGenerated={onPlanUpdate}
        /></AnimatedElement>;
      case 'exams':
        return <AnimatedElement><ExamPortal 
            studentId={user.id}
            exams={exams}
            submissions={examSubmissions}
            onSubmitExam={onSubmitExam}
        /></AnimatedElement>;
      case 'files':
        return <AnimatedElement><FileManager mode="student" /></AnimatedElement>;
      case 'links':
        return <AnimatedElement><SharedLinksView /></AnimatedElement>;
      case 'recommendations':
        return <AnimatedElement><RecommendationsTab student={studentData} mentors={MOCK_MENTORS} /></AnimatedElement>;
      default:
        return null;
    }
  };

  return (
    <>
      <Header user={user} onLogout={onLogout} onOpenSettings={() => setIsSettingsOpen(true)} />
       {isSettingsOpen && (
        <AccountSettings
            user={user}
            onUpdateUser={onUpdateUser}
            onClose={() => setIsSettingsOpen(false)}
        />
      )}
       {isCheckinFlowOpen && verifiedLocation && (
        <AttendanceCheckinFlow 
            user={user} 
            onClose={() => setIsCheckinFlowOpen(false)} 
            location={verifiedLocation} 
        />
       )}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatedElement>
          <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
          <p className="text-gray-400 mb-6">Welcome back, {user.name}!</p>
        </AnimatedElement>
        
        <AnimatedElement className="border-b border-gray-700 mb-6" delay={100}>
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'overview' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'progress' ? 'active' : ''}`}
            >
              Progress Tracker
            </button>
             <button
              onClick={() => setActiveTab('recommendations')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'recommendations' ? 'active' : ''}`}
            >
              Smart Recommendations
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'exams' ? 'active' : ''}`}
            >
              Exam Portal
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'leave' ? 'active' : ''}`}
            >
              Leave Applications
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'attendance' ? 'active' : ''}`}
            >
              Full Attendance Record
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'learning' ? 'active' : ''}`}
            >
                AI Learning Planner
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'files' ? 'active' : ''}`}
            >
                Files
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`tab-button py-3 px-1 font-medium text-sm text-gray-400 hover:text-white ${activeTab === 'links' ? 'active' : ''}`}
            >
                Important Links
            </button>
          </nav>
        </AnimatedElement>

        {renderContent()}
      </main>
      
      <Chatbot 
        context={chatbotContext} 
        userRole={UserRole.Student} 
        actions={chatbotActions} 
      />
    </>
  );
};

export default StudentDashboard;