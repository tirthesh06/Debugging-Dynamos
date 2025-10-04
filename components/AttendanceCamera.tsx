import React, { useRef, useEffect, useState, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student } from '../types';

interface AttendanceCameraProps {
  students: Student[];
  onClose: (updatedAttendance: { [studentId: string]: 'Present' | 'Absent' }) => void;
}

const AttendanceCamera: React.FC<AttendanceCameraProps> = ({ students, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [localAttendance, setLocalAttendance] = useLocalStorage<{ [studentId: string]: 'Present' | 'Absent' }>(
    'offline-attendance',
    {}
  );

  useEffect(() => {
    async function setupCamera() {
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
        setScanMessage(message);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleScan = useCallback(() => {
    setIsScanning(true);
    setScanMessage('Scanning for faces... Please hold still.');

    window.setTimeout(() => {
      // Simulate recognizing a random subset of students
      const updatedAttendance = { ...localAttendance };
      const studentsToMark = students.slice(0, Math.floor(Math.random() * students.length) + 1);
      
      studentsToMark.forEach(student => {
          updatedAttendance[student.id] = 'Present';
      });

      setLocalAttendance(updatedAttendance);
      setScanMessage(`Recognized ${studentsToMark.length} students. Data saved locally.`);
      setIsScanning(false);
    }, 3000);
  }, [localAttendance, setLocalAttendance, students]);
  
  const handleCloseAndSync = () => {
      onClose(localAttendance);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl text-center shadow-xl">
        <h2 className="text-2xl font-bold mb-4">AI Face Recognition Attendance</h2>
        <div className="bg-black rounded-md overflow-hidden border-2 border-gray-600 mb-4">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
        </div>
        <p className="text-gray-300 mb-4 h-6">{scanMessage}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed transition duration-150 flex items-center"
          >
            {isScanning && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </button>
          <button
            onClick={handleCloseAndSync}
            className="px-6 py-2 bg-gray-600 rounded-md hover:bg-gray-700 transition duration-150"
          >
            Close & Sync
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">This is a simulation. Attendance data is saved to your browser's local storage for offline demo.</p>
      </div>
    </div>
  );
};

export default AttendanceCamera;
