import { useState, useEffect, useRef, useCallback } from 'react';

interface IdleTimerProps {
  onIdle: () => void;
  onPrompt: () => void;
  idleTime: number;
  promptTime: number;
  isEnabled?: boolean;
}

const useIdleTimer = ({ onIdle, onPrompt, idleTime, promptTime, isEnabled = true }: IdleTimerProps) => {
  // The return type of `setTimeout` in a browser environment is `number`.
  // Using `window.setTimeout` and `window.clearTimeout` explicitly avoids
  // potential type conflicts with Node.js types if `@types/node` is present.
  const idleTimeout = useRef<number | null>(null);
  const promptTimeout = useRef<number | null>(null);

  const reset = useCallback(() => {
    // Clear existing timers
    if (promptTimeout.current) window.clearTimeout(promptTimeout.current);
    if (idleTimeout.current) window.clearTimeout(idleTimeout.current);

    if (!isEnabled) return;
    
    // Set new timers
    promptTimeout.current = window.setTimeout(onPrompt, idleTime - promptTime);
    idleTimeout.current = window.setTimeout(onIdle, idleTime);
  }, [onIdle, onPrompt, idleTime, promptTime, isEnabled]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleUserActivity = () => {
      reset();
    };
    
    // Initial setup
    reset();

    // Add event listeners
    events.forEach(event => window.addEventListener(event, handleUserActivity, { passive: true }));

    // Cleanup
    return () => {
      if (promptTimeout.current) window.clearTimeout(promptTimeout.current);
      if (idleTimeout.current) window.clearTimeout(idleTimeout.current);
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [reset]);
  
  return { reset };
};

export default useIdleTimer;
