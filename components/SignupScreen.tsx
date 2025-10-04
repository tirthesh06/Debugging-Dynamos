import React, { useState, useEffect, useMemo } from 'react';
import { UserRole } from '../types';
import FaceScan from './FaceScan';
import AnimatedElement from './AnimatedElement';

interface SignupScreenProps {
  onSignup: (details: { name: string, email: string, role: UserRole, password: string, childEmail?: string, registeredPhotoUrl: string }) => void;
  onSwitchToLogin: () => void;
  onSocialLogin: (role: UserRole) => void;
  error: string | null;
}

const PasswordRequirement: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <li className={`flex items-center gap-2 text-sm transition-colors ${isValid ? 'text-green-400' : 'text-gray-400'}`}>
        {isValid ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
        ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
        )}
        <span>{text}</span>
    </li>
);

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignup, onSwitchToLogin, onSocialLogin, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [childEmail, setChildEmail] = useState('');
  const [isFaceScanVisible, setIsFaceScanVisible] = useState(false);

  const passwordValidation = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    
    const allValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      allValid,
    };
  }, [password]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValidation.allValid) {
        alert("Please ensure your password meets all the security requirements.");
        return;
    }
    if (name && email && password) {
      if (role === UserRole.Parent && !childEmail) {
        // Simple validation, App.tsx handles the more robust check
        alert("Please enter your child's email address.");
        return;
      }
      setIsFaceScanVisible(true);
    }
  };
  
  const handleFaceScanSuccess = (imageDataUrl: string) => {
    setIsFaceScanVisible(false);
    onSignup({ name, email, role, password, childEmail, registeredPhotoUrl: imageDataUrl });
  }

  const SocialButton: React.FC<{ onClick: () => void; icon: React.ReactElement; label: string }> = ({ onClick, icon, label }) => (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
      {icon}
      <span className="text-sm font-medium text-gray-200">{label}</span>
    </button>
  );

  return (
    <>
      {isFaceScanVisible && (
        <FaceScan 
            title="Signup Verification"
            onClose={() => setIsFaceScanVisible(false)}
            onSuccess={handleFaceScanSuccess}
            mode="signup"
        />
      )}
      <div className="flex items-center justify-center min-h-screen p-4">
        <AnimatedElement className="w-full max-w-md">
          <div className="p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-2">
                <svg className="h-10 w-10 text-indigo-400" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><line x1="3" y1="6" x2="3" y2="19" /><line x1="12" y1="6" x2="12" y2="19" /><line x1="21" y1="6" x2="21" y2="19" /></svg>
                <h1 className="text-3xl font-bold text-white tracking-tight">Smart Curriculum</h1>
              </div>
              <h2 className="text-2xl font-bold text-white">Create your account</h2>
              <p className="text-gray-400">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-medium text-indigo-400 hover:text-indigo-500">
                  Log in
                </button>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="name">Full Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
              </div>
               {password && (
                 <div className="p-3 bg-gray-900/50 rounded-lg">
                    <ul className="space-y-1">
                        <PasswordRequirement isValid={passwordValidation.hasMinLength} text="At least 8 characters" />
                        <PasswordRequirement isValid={passwordValidation.hasLowercase} text="A lowercase letter (a-z)" />
                        <PasswordRequirement isValid={passwordValidation.hasUppercase} text="An uppercase letter (A-Z)" />
                        <PasswordRequirement isValid={passwordValidation.hasNumber} text="A number (0-9)" />
                        <PasswordRequirement isValid={passwordValidation.hasSpecialChar} text="A special character (!@#$...)" />
                    </ul>
                 </div>
               )}
              <div>
                 <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="role">I am a</label>
                 <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                    <option value={UserRole.Student}>Student</option>
                    <option value={UserRole.Teacher}>Teacher</option>
                    <option value={UserRole.Parent}>Parent</option>
                 </select>
              </div>
              {role === UserRole.Parent && (
                <div>
                  <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="childEmail">Child's Email</label>
                  <input id="childEmail" type="email" value={childEmail} onChange={(e) => setChildEmail(e.target.value)} placeholder="Your Child's Email Address" required className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                </div>
              )}
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <button type="submit" 
                disabled={!passwordValidation.allValid}
                className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 transform hover:scale-105"
              >
                Create Account & Scan Face
              </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-400">Or continue with</span></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SocialButton onClick={() => onSocialLogin(UserRole.Student)} icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.319-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C42.012 36.426 44 30.865 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>} label="Google" />
                <SocialButton onClick={() => onSocialLogin(UserRole.Parent)} icon={<svg className="w-5 h-5 text-white" viewBox="0 0 23 23"><path fill="currentColor" d="M1 1h10v10H1V1zm11 0h10v10H12V1zM1 12h10v10H1V12zm11 0h10v10H12V12z"></path></svg>} label="Microsoft" />
                <SocialButton onClick={() => onSocialLogin(UserRole.Teacher)} icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>} label="Mobile" />
            </div>
          </div>
        </AnimatedElement>
      </div>
    </>
  );
};

export default SignupScreen;