import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import Spinner from './Spinner';

declare var QRCode: any;

interface QRCodeGeneratorProps {
  user: User;
}

const QR_CODE_VALIDITY_SECONDS = 60;

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ user }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(QR_CODE_VALIDITY_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateQRCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQrCodeUrl(null);
    setExpiresIn(QR_CODE_VALIDITY_SECONDS);

    // This function waits for the QRCode library to be loaded from the external script.
    // It polls every 100ms until window.QRCode is available.
    const waitForQRCode = (): Promise<void> =>
      new Promise((resolve) => {
        const check = () => {
          if (typeof QRCode !== 'undefined') {
            resolve();
          } else {
            window.setTimeout(check, 100);
          }
        };
        check();
      });

    try {
      await waitForQRCode();

      const studentData = {
        studentId: user.id,
        timestamp: Date.now(),
      };
      const qrDataString = btoa(JSON.stringify(studentData));

      // QRCode.toDataURL returns a promise
      const url = await QRCode.toDataURL(qrDataString, { width: 256, margin: 2 });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('QR Code generation failed:', err);
      setError('Could not generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  useEffect(() => {
    if (isLoading || expiresIn <= 0) return;
    const timer = setInterval(() => {
      setExpiresIn((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, expiresIn]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-xl font-bold text-white mb-2">My Attendance QR</h3>
      <p className="text-gray-400 mb-4 text-center text-sm">
        Present this to your teacher to mark attendance.
      </p>
      <div className="bg-white p-4 rounded-lg shadow-lg w-56 h-56 flex items-center justify-center">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : isLoading ? (
          <Spinner />
        ) : qrCodeUrl ? (
          <img src={qrCodeUrl} alt="Attendance QR Code" />
        ) : null}
      </div>
      <div className="mt-4 text-center h-12 flex flex-col justify-center items-center">
        {expiresIn > 0 && !isLoading ? (
          <p className="text-lg text-yellow-400">
            Expires in: <span className="font-bold text-2xl">{expiresIn}s</span>
          </p>
        ) : null}
        {expiresIn <= 0 && !isLoading && (
          <>
            <p className="text-lg font-bold text-red-500">QR Code Expired</p>
            <button
              onClick={generateQRCode}
              className="mt-2 px-4 py-1 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Regenerate
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
