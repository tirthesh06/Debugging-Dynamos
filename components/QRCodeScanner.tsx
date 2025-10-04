import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { verifyAttendanceAttempt } from '../services/geminiService';
import Spinner from './Spinner';

// Make Html5Qrcode globally available from the script tag in index.html
declare var Html5Qrcode: any;

interface QRCodeScannerProps {
  onClose: () => void;
  onScanSuccess: (studentId: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onClose, onScanSuccess }) => {
  const scannerRef = useRef<any>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const [scanResult, setScanResult] = useState<{ type: 'error'; message: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  useEffect(() => {
    // This check prevents re-initializing the scanner on re-renders
    if (!readerRef.current || scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(readerRef.current.id);
    scannerRef.current = html5QrCode;

    const qrCodeSuccessCallback = async (decodedText: string) => {
      if(scanResult || isVerifying) return; // Don't process if an error is already shown or we're verifying

      scannerRef.current.pause();
      setIsVerifying(true);

      try {
        const decodedData = JSON.parse(atob(decodedText));
        const { studentId, timestamp, location } = decodedData;
        
        if (!studentId || !timestamp || !location) {
          throw new Error("Invalid or outdated QR code data.");
        }
        
        // AI Verification Step
        const verificationResult = await verifyAttendanceAttempt({ studentId, timestamp, location });

        if (verificationResult?.isVerified) {
          onScanSuccess(studentId);
        } else {
          setScanResult({ type: 'error', message: `Verification Failed: ${verificationResult?.reason || 'Could not verify attendance.'}` });
        }

      } catch (e) {
        setScanResult({ type: 'error', message: 'Invalid or unreadable QR code format.' });
      } finally {
        setIsVerifying(false);
      }
    };
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
    
    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined)
      .catch(() => {
         setScanResult({ type: 'error', message: 'Could not start camera. Please check permissions.'});
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error("Failed to stop scanner", err));
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, scanResult, isVerifying]);

  const handleRetry = () => {
    setScanResult(null);
    scannerRef.current?.resume();
  }
  
  return (
    <Modal title="Scan Student QR Code" onClose={onClose}>
        <div className="w-full max-w-md mx-auto relative">
           <div id="qr-reader" ref={readerRef} className="w-full border-2 border-gray-600 rounded-lg overflow-hidden bg-black"></div>
           {isVerifying && (
             <div className="absolute inset-0 bg-gray-800/90 flex flex-col items-center justify-center text-center p-4">
                <Spinner />
                <p className="text-xl font-bold text-white mt-4">AI Verification in Progress...</p>
                <p className="text-gray-300 mt-2">Checking timestamp and location for security.</p>
             </div>
           )}
           {scanResult && !isVerifying && (
             <div className="absolute inset-0 bg-gray-800/90 flex flex-col items-center justify-center text-center p-4">
                <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xl font-bold text-red-400">Scan Failed</p>
                <p className="text-gray-300 mt-2">{scanResult.message}</p>
                <div className="flex gap-4 mt-6">
                    <button onClick={handleRetry} className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700">Scan Again</button>
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Close</button>
                </div>
            </div>
           )}
           {!scanResult && !isVerifying && (
            <p className="text-white text-center mt-4">Point camera at student's QR code</p>
           )}
        </div>
    </Modal>
  );
};

export default QRCodeScanner;
