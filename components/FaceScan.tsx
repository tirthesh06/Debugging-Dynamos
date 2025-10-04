import React, { useRef, useEffect, useState, useCallback } from 'react';
import Spinner from './Spinner';
import { User } from '../types';
import {verifyFaceMatch} from '../services/geminiService';

// Use a discriminated union for stronger type safety between login and signup modes.
type FaceScanProps = {
  onClose: () => void;
  title?: string;
} & (
  {
    mode: 'signup';
    onSuccess: (imageDataUrl: string) => void;
    registeredPhotoUrl?: never; // Ensure registeredPhotoUrl is not passed in signup mode
  } | {
    mode: 'login';
    onSuccess: () => void;
    registeredPhotoUrl: string; // Ensure registeredPhotoUrl is passed in login mode
  }
);

// Helper to convert a data URL string to a base64 string (without the prefix)
const getBase64FromDataUrl = (dataUrl: string): string => {
    return dataUrl.split(',')[1];
};

// Helper to fetch a URL (like pravatar) and convert it to a base64 string
const fetchAndConvertToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch registered image');
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


const FaceScan: React.FC<FaceScanProps> = ({ onSuccess, onClose, title, mode, registeredPhotoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [comparisonStatus, setComparisonStatus] = useState<'idle' | 'comparing' | 'success' | 'fail'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [localRegisteredImageUrl, setLocalRegisteredImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    // This effect now uses the prop directly for login mode, avoiding localStorage lookups.
    if (mode === 'login') {
      setIsImageLoading(true);
      setMessage('Loading registered photo...');
      if (registeredPhotoUrl) {
          setLocalRegisteredImageUrl(registeredPhotoUrl);
          setMessage('Position your face to verify your identity.');
      } else {
          // Fallback for an unlikely edge case where the prop is missing.
          setLocalRegisteredImageUrl('https://picsum.photos/seed/default-avatar/256/320?grayscale');
          setMessage('No face registration data found for this user.');
          setError('No face registration data found for this user.');
      }
      setIsImageLoading(false);
    } else if (mode === 'signup') {
        setIsImageLoading(false);
        setMessage('Position your face to register for Face ID.');
    }
  }, [mode, registeredPhotoUrl]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API not supported by your browser.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        let message = "Could not access camera. Please ensure it is not in use and permissions are enabled.";
        if (err instanceof DOMException) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                message = "Camera access denied. Please enable permissions in your browser settings.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                message = "No camera found. Please ensure a camera is connected and enabled.";
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                message = "Cannot access camera. It might be in use by another application or have a hardware issue.";
            }
        }
        setError(message);
      }
    }
    setupCamera();
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const captureImage = (): string | null => {
    if (videoRef.current) {
        const video = videoRef.current;
        // PREVENT CAPTURING 0x0 IMAGE: Ensure video metadata is loaded.
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn("Video stream is not ready or has no dimensions. Cannot capture image.");
            return null;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/png');
        }
    }
    return null;
  };

  const handleStartScan = useCallback(() => {
    if (mode !== 'signup') return; // Type guard ensures `onSuccess` has the correct signature
    
    setStatus('scanning');
    
    window.setTimeout(() => {
      setScanStepMessage('Analyzing facial landmarks...');
      window.setTimeout(() => {
        setScanStepMessage('Generating biometric template...');
        window.setTimeout(() => {
            const imageDataUrl = captureImage();
            if (imageDataUrl) {
                setStatus('success');
                setScanStepMessage('');
                setMessage('✅ Biometric profile created successfully!');
                window.setTimeout(() => {
                    stopCamera();
                    onSuccess(imageDataUrl);
                }, 1500);
            } else {
                setStatus('idle');
                setError('Could not capture image from camera.');
                setMessage('');
                setScanStepMessage('');
            }
        }, 1500);
      }, 1500);
    }, 100);
  }, [mode, onSuccess, stopCamera]);
  
  const handleCompareAndVerify = useCallback(async () => {
    if (mode !== 'login') return; // Type guard ensures `onSuccess` has the correct signature
    
    setComparisonStatus('comparing');
    setScanStepMessage('Capturing live image...');
    
    const liveImageDataUrl = captureImage();
    if (!liveImageDataUrl || !localRegisteredImageUrl) {
        setComparisonStatus('fail');
        setMessage('Could not capture images for comparison.');
        setScanStepMessage('');
        return;
    }

    try {
        setScanStepMessage('Preparing images for AI analysis...');
        const liveImageBase64 = getBase64FromDataUrl(liveImageDataUrl);
        
        // Check if localRegisteredImageUrl is a data URL or a regular URL that needs fetching
        const registeredImageBase64 = localRegisteredImageUrl.startsWith('data:')
            ? getBase64FromDataUrl(localRegisteredImageUrl)
            : await fetchAndConvertToBase64(localRegisteredImageUrl);
        
        let result = null;
        let retries = 2; // Allow 2 retries
        setScanStepMessage('Verifying with AI... This may take a moment.');

        while (retries > 0 && !result) {
            result = await verifyFaceMatch(registeredImageBase64, liveImageBase64);
            if (!result) {
                retries--;
                if (retries > 0) {
                    setScanStepMessage(`Verification timed out. Retrying... (${retries} left)`);
                    await new Promise(res => setTimeout(res, 2000)); // Wait 2 seconds before retrying
                }
            }
        }

        // Stricter validation to ensure the entire AI response object is well-formed.
        if (result && typeof result.isMatch === 'boolean' && typeof result.confidence === 'number' && typeof result.reason === 'string') {
            setConfidence(result.confidence);
            if (result.isMatch && result.confidence >= 80) { // Using 80 as confidence threshold
                setComparisonStatus('success');
                setMessage(`✅ Match Confirmed! Confidence: ${result.confidence.toFixed(1)}%`);
                setScanStepMessage(result.reason);
                window.setTimeout(() => {
                    stopCamera();
                    onSuccess();
                }, 2000);
            } else {
                setComparisonStatus('fail');
                setMessage(`❌ Verification Failed. Confidence: ${result.confidence.toFixed(1)}%`);
                setScanStepMessage(result.reason || "Low confidence score. Please try again.");
            }
        } else {
            // Handle null or malformed response from verifyFaceMatch after retries.
            setComparisonStatus('fail');
            setMessage('An error occurred during verification.');
            setScanStepMessage('The AI service returned an invalid response. Please try again.');
        }
    } catch (e) {
        console.error("Face verification failed:", e);
        setComparisonStatus('fail');
        setMessage('An error occurred during verification.');
        setScanStepMessage(e instanceof Error ? e.message : 'Could not complete verification process.');
    }
  }, [mode, onSuccess, stopCamera, localRegisteredImageUrl]);

  const handleTryAgain = () => {
    setComparisonStatus('idle');
    setScanStepMessage('');
    setMessage('Position your face to verify your identity.');
    setConfidence(0);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://picsum.photos/seed/default-avatar/256/320?grayscale';
    setIsImageLoading(false);
    setMessage('Registered photo failed to load.');
    setError('Registered photo failed to load.');
  };


  const renderSignupView = () => (
     <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md text-center shadow-2xl border border-gray-700 relative">
        <h2 className="text-2xl font-bold mb-4 text-white">{title || 'Face Scan Registration'}</h2>
        
        {error ? (
          <div className="text-red-400 p-4 bg-red-900/50 rounded-lg min-h-[320px] flex items-center justify-center">{error}</div>
        ) : (
          <div className="relative w-64 h-80 mx-auto rounded-lg overflow-hidden border-4 border-gray-600 mb-4 flex items-center justify-center bg-gray-900">
            <video ref={videoRef} autoPlay playsInline muted className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover transform scale-x-[-1]" />
            <div className={`absolute inset-0 transition-all duration-500 rounded-md ${
              status === 'scanning' ? 'border-8 border-cyan-400 animate-pulse' :
              status === 'success' ? 'border-8 border-green-500' :
              'border-4 border-gray-600'
            }`}></div>
            {status === 'scanning' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_5px_rgba(0,255,255,0.7)] animate-scan-y"></div>
            )}
            {status === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/50">
                    <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
          </div>
        )}
        
        <p className={`text-lg h-8 mb-2 font-medium transition-colors duration-300 ${
            status === 'success' ? 'text-green-400' : 'text-gray-300'
        }`}>{message}</p>
        <p className="text-sm h-5 text-cyan-400">{scanStepMessage}</p>

        <div className="flex justify-center space-x-4 mt-4">
          {status === 'idle' && !error && (
            <button onClick={handleStartScan} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
              Start Scan
            </button>
          )}
          <button onClick={handleClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">
            {status === 'success' ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoginView = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-3xl text-center shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">{title || 'Face Verification'}</h2>
        {error ? (
          <div className="text-red-400 p-4 bg-red-900/50 rounded-lg min-h-[320px] flex items-center justify-center">
            <div>
              <p>{error}</p>
              <button onClick={handleClose} className="mt-4 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-start mb-4">
              {/* Registered Photo Panel */}
              <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Registered Faceprint</h3>
                <div className="bg-gray-900 rounded-lg p-2 border-2 border-gray-600 flex items-center justify-center aspect-[4/5]">
                  {isImageLoading ? (
                    <Spinner />
                  ) : (
                    <img
                      id="registered-user-image"
                      src={localRegisteredImageUrl!}
                      alt="Registered User"
                      className="rounded-md w-full object-cover aspect-[4/5]"
                      onError={handleImageError}
                    />
                  )}
                </div>
              </div>
              {/* Live Camera Panel */}
              <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Live Verification Scan</h3>
                <div className={`relative w-full aspect-[4/5] rounded-lg overflow-hidden border-4 bg-gray-900 transition-colors duration-300 ${
                  comparisonStatus === 'comparing' ? 'border-cyan-400 animate-pulse' :
                  comparisonStatus === 'success' ? 'border-green-500' :
                  comparisonStatus === 'fail' ? 'border-red-500' : 'border-gray-600'
                }`}>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                  {comparisonStatus === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/50">
                        <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                  )}
                   {comparisonStatus === 'comparing' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_5px_rgba(0,255,255,0.7)] animate-scan-y"></div>
                  )}
                </div>
              </div>
            </div>
            
             <div className="h-16 my-2 flex flex-col justify-center">
                 <p className={`text-lg font-medium transition-colors duration-300 ${
                     comparisonStatus === 'success' ? 'text-green-400' :
                     comparisonStatus === 'fail' ? 'text-red-400' : 'text-gray-300'
                 }`}>{message}</p>
                 <p className="text-sm h-5 text-cyan-400">{scanStepMessage}</p>
                 {comparisonStatus === 'comparing' && (
                    <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                      <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${confidence}%`, transition: 'width 1.5s ease-in-out' }}></div>
                    </div>
                 )}
             </div>

            <div className="flex justify-center space-x-4">
               <button
                  onClick={comparisonStatus === 'fail' ? handleTryAgain : handleCompareAndVerify}
                  disabled={isImageLoading || comparisonStatus === 'comparing' || comparisonStatus === 'success' || !!error}
                  className="px-6 py-2 w-48 text-lg bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center"
               >
                 {comparisonStatus === 'comparing' ? <Spinner /> : 
                  comparisonStatus === 'fail' ? 'Try Again' : 'Compare & Verify'}
               </button>
               <button onClick={handleClose} className="px-6 py-2 text-lg bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">
                 Cancel
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {mode === 'login' ? renderLoginView() : renderSignupView()}
      <style>{`
        @keyframes scan-y {
          0% { transform: translateY(0%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-scan-y {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 0%, rgba(0, 255, 255, 0.4) 50%, transparent 100%);
          animation: scan-y 2.5s infinite ease-in-out;
          box-shadow: none;
        }
      `}</style>
    </>
  );
};

export default FaceScan;
