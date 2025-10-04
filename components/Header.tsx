import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSettings }) => {
  return (
    <div className="sticky top-0 z-40">
      {/* Decorative top bar inspired by the image */}
      <div className="h-1 bg-purple-600"></div>

      {/* Main navigation bar */}
      <nav className="bg-gray-950 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="container mx-auto flex items-center justify-between h-16">
          {/* Brand/Logo on the left */}
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="bug icon">🐞</span>
            <span className="text-xl font-bold text-white tracking-tight">Debugging Dynamos ✨</span>
          </div>
          
          {/* Actions on the right */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="hidden sm:inline text-gray-300">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </span>
            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-300 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors"
              aria-label="Account Settings"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
            {/* CTA-style Logout Button */}
            <button
              onClick={onLogout}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-950 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header