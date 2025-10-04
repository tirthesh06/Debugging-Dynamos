import React from 'react';

interface AttendanceWarningScreenProps {
  onLogout: () => void;
}

const AttendanceWarningScreen: React.FC<AttendanceWarningScreenProps> = ({ onLogout }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-center text-white">
      <div className="w-full max-w-lg p-10 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-red-500/50">
        <h1 className="text-3xl font-bold text-red-400 mb-4">Access Restricted</h1>
        <p className="text-lg text-gray-300 leading-relaxed">
          Your access to the student portal has been temporarily blocked.
        </p>
        <p className="mt-6 text-xl font-semibold text-yellow-300">
          Please meet your class teacher or the Head of Department (HOD) for further details and to resolve the issue.
        </p>
        <button
          onClick={onLogout}
          className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-transform transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AttendanceWarningScreen;