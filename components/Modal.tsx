import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl border border-gray-700 relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
      >
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
