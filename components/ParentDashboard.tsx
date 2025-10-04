import React, { useState, useMemo } from 'react';
import { User, Student, UserRole } from '../types';
import Header from './Header';
import Chatbot from './Chatbot';
import RollAccountView from './RollAccountView';
import LearningPathView from './LearningPathView';
import PersonalizedSuggestions from './PersonalizedSuggestions';
import ProgressTracker from './ProgressTracker';
import AccountSettings from './AccountSettings';
import MentorSuggestion from './MentorSuggestion';
import { MOCK_MENTORS } from '../data/mockData';
import AIParentSummary from './AIParentSummary';
import LearningStrategies from './LearningStrategies';

interface ParentDashboardProps {
  user: User;
  onLogout: () => void;
  childData: Student;
  onUpdateUser: (user: User) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, onLogout, childData, onUpdateUser }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const totalClasses = childData.attendance.length;
  const presentClasses = childData.attendance.filter(a => a.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

  const latestAttendance = [...childData.attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const chatbotActions = useMemo(() => ({}), []);

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
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Parent Dashboard</h1>
        <p className="text-gray-400 mb-6">Viewing academic progress for <span className="font-semibold text-white">{childData.name}</span>.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-indigo-400">Overall Attendance</h3>
              <p className="text-4xl font-bold mt-2">{attendancePercentage.toFixed(1)}%</p>
              <p className="text-gray-400">{presentClasses} of {totalClasses} classes attended</p>
            </div>
             <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-indigo-400">Most Recent Record</h3>
              {latestAttendance ? (
                <>
                  <p className="text-2xl font-bold mt-2">
                     <span className={`font-semibold ${latestAttendance.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
                        {latestAttendance.status}
                     </span>
                  </p>
                  <p className="text-gray-400">{new Date(latestAttendance.date).toLocaleDateString()} - {latestAttendance.subject}</p>
                </>
              ) : (
                <p className="text-gray-400 mt-2">No attendance records yet.</p>
              )}
            </div>
             <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-indigo-400">Have a Question?</h3>
              <p className="text-gray-400 mt-2">Use our AI assistant to get quick answers about your child's progress or school policies.</p>
            </div>
        </div>
        
        <div className="my-8">
          <AIParentSummary student={childData} />
        </div>

        <div className="my-8">
            <ProgressTracker student={childData} />
        </div>
        
        <div className="my-8">
            <LearningStrategies student={childData} />
        </div>

        <div className="my-8">
          <PersonalizedSuggestions childData={childData} />
        </div>

        <div className="my-8">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Mentor Matching</h3>
                <p className="text-gray-400 mb-6 text-center max-w-2xl mx-auto">
                    Our AI can analyze {childData.name}'s academic profile to find an ideal mentor who can provide guidance and support in their field of study.
                </p>
                <MentorSuggestion child={childData} mentors={MOCK_MENTORS} />
            </div>
        </div>

        {childData.learningPath ? (
          <div className="my-8">
            <LearningPathView learningPath={childData.learningPath} />
          </div>
        ) : null}

        <RollAccountView attendance={childData.attendance} />

      </main>
      <Chatbot 
        context={`User is a parent named ${user.name}, viewing data for their child, ${childData.name}.`} 
        userRole={UserRole.Parent}
        actions={chatbotActions}
      />
    </>
  );
};

export default ParentDashboard;
