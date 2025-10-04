import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface IdleTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void; // Called when "Stay Logged In" is clicked
  onLogout: () => void;
  countdownTime: number; // in milliseconds
}

const IdleTimeoutModal: React.FC<IdleTimeoutModalProps> = ({ isOpen, onClose, onLogout, countdownTime }) => {
  const [countdown, setCountdown] = useState(Math.ceil(countdownTime / 1000));

  useEffect(() => {
    if (isOpen) {
      setCountdown(Math.ceil(countdownTime / 1000));
      const interval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, countdownTime]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div 
        className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl border border-yellow-500/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="idle-modal-title"
      >
        <h2 id="idle-modal-title" className="text-2xl font-bold text-yellow-300 mb-4">Are you still there?</h2>
        <p className="text-gray-300 mb-2">For your security, you will be logged out due to inactivity.</p>
        <p className="text-4xl font-bold text-white my-4">{countdown}</p>
        <p className="text-gray-400 mb-6">seconds remaining</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
          >
            Logout Now
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            autoFocus
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdleTimeoutModal;