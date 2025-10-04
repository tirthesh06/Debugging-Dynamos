import React, { useState } from 'react';
import { User } from '../types';
import Modal from './Modal';
import Spinner from './Spinner';

interface AccountSettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUpdateUser, onClose }) => {
  const [scanOnLogin, setScanOnLogin] = useState(user.enableScanOnLogin || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = () => {
    setIsSaving(true);
    const newSetting = !scanOnLogin;
    setScanOnLogin(newSetting);

    // Simulate async save
    window.setTimeout(() => {
      onUpdateUser({ ...user, enableScanOnLogin: newSetting });
      setIsSaving(false);
    }, 500);
  };

  return (
    <Modal title="Account Settings" onClose={onClose}>
      <div className="p-2 sm:p-4 text-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-900/50 rounded-lg">
          <div className="mb-4 sm:mb-0 sm:mr-4">
            <h3 className="font-semibold text-white">Enable Face Scan on Login</h3>
            <p className="text-sm text-gray-400 max-w-md">
              For enhanced security, require a face scan every time you log in with your password.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {isSaving && <Spinner />}
            <button
              role="switch"
              aria-checked={scanOnLogin}
              onClick={handleToggle}
              disabled={isSaving}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 ${
                scanOnLogin ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  scanOnLogin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AccountSettings;
