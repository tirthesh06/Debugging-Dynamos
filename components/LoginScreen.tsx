import React, { useState } from 'react';
import FaceScan from './FaceScan';
import AnimatedElement from './AnimatedElement';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => void;
  onSwitchToSignup: () => void;
  onProviderLogin: (identifier: string, type: 'email' | 'mobile') => void;
  error: string | null;
  onClearError: () => void;
  users: User[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToSignup, onProviderLogin, error, onClearError, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFaceScanVisible, setIsFaceScanVisible] = useState(false);
  const [userForFaceScan, setUserForFaceScan] = useState<User | null>(null);
  const [provider, setProvider] = useState<'google' | 'microsoft' | 'mobile' | null>(null);
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guard against empty submission, though HTML 'required' should prevent this.
    if (!email || !password) return;

    const user = users.find(u => u.email === email && u.password === password);

    // If no user is found, the onLogin function is called to trigger the 'Invalid credentials' error in the parent.
    if (!user) {
      onLogin(email, password);
      return;
    }

    // If a user is found, check if face scan is enabled for them.
    if (user.enableScanOnLogin) {
      // Store the user and show the face scan modal.
      setUserForFaceScan(user);
      setIsFaceScanVisible(true);
    } else {
      // If scan is not required, log the user in directly.
      onLogin(email, password);
    }
  };

  const handleFaceScanSuccess = () => {
    setIsFaceScanVisible(false);
    // onLogin requires email and password, which we still have in state.
    if (userForFaceScan) {
      onLogin(userForFaceScan.email, userForFaceScan.password!);
    }
    setUserForFaceScan(null);
  };
  
  const handleCloseFaceScan = () => {
    setIsFaceScanVisible(false);
    setUserForFaceScan(null);
  }
  
  const handleProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    onProviderLogin(identifier, provider === 'mobile' ? 'mobile' : 'email');
  };

  const handleCloseProviderModal = () => {
    setProvider(null);
    setIdentifier('');
    onClearError();
  };

  const SocialButton: React.FC<{ onClick: () => void; icon: React.ReactElement; label: string }> = ({ onClick, icon, label }) => (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
      {icon}
      <span className="text-sm font-medium text-gray-200">{label}</span>
    </button>
  );

  return (
    <>
      {isFaceScanVisible && userForFaceScan && (
        <FaceScan
          title="Login Verification"
          onClose={handleCloseFaceScan}
          onSuccess={handleFaceScanSuccess}
          mode="login"
          registeredPhotoUrl={userForFaceScan.registeredPhotoUrl}
        />
      )}
      {provider && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Sign in with <span className="capitalize">{provider}</span>
            </h2>
            <form onSubmit={handleProviderSubmit} className="space-y-4">
              <input
                type={provider === 'mobile' ? 'tel' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={provider === 'mobile' ? 'Enter Mobile Number' : 'Enter Email Address'}
                required
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                autoFocus
              />
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <div className="flex justify-center space-x-4 pt-2">
                <button
                  type="button"
                  onClick={handleCloseProviderModal}
                  className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center min-h-screen p-4">
        <AnimatedElement className="w-full max-w-md">
          <div className="p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
            <div className="text-center space-y-2">
                <div className="flex justify-center items-center gap-2">
                    <svg className="h-10 w-10 text-indigo-400" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><line x1="3" y1="6" x2="3" y2="19" /><line x1="12" y1="6" x2="12" y2="19" /><line x1="21" y1="6" x2="21" y2="19" /></svg>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Smart Curriculum</h1>
                </div>
                <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                <p className="text-gray-400">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignup} className="font-medium text-indigo-400 hover:text-indigo-500">
                        Sign up
                    </button>
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address (e.g., student@school.com)"
                  required
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (e.g., password123)"
                  required
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
              {!provider && error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <button type="submit" className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-transform transform hover:scale-105 duration-300 ease-in-out">
                Login
              </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-400">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SocialButton onClick={() => setProvider('google')} icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.319-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C42.012 36.426 44 30.865 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>} label="Google" />
                <SocialButton onClick={() => setProvider('microsoft')} icon={<svg className="w-5 h-5 text-white" viewBox="0 0 23 23"><path fill="currentColor" d="M1 1h10v10H1V1zm11 0h10v10H12V1zM1 12h10v10H1V12zm11 0h10v10H12V12z"></path></svg>} label="Microsoft" />
                <SocialButton onClick={() => setProvider('mobile')} icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>} label="Mobile" />
            </div>

          </div>
        </AnimatedElement>
      </div>
    </>
  );
};

export default LoginScreen;