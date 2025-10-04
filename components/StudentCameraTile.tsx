import React, { RefObject } from 'react';
import { Student, EngagementStatus } from '../types';

interface StudentCameraTileProps {
  student: Student;
  isLiveFeed: boolean;
  videoRef?: RefObject<HTMLVideoElement>;
}

const StudentCameraTile: React.FC<StudentCameraTileProps> = ({ student, isLiveFeed, videoRef }) => {
  const status = student.engagementStatus || EngagementStatus.Unknown;

  const getStatusStyles = () => {
    switch (status) {
      case EngagementStatus.Engaged:
        return {
          borderColor: 'border-green-500',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500',
        };
      case EngagementStatus.Neutral:
        return {
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500',
        };
      case EngagementStatus.Disengaged:
        return {
          borderColor: 'border-red-500',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500',
        };
      default:
        return {
          borderColor: 'border-gray-600',
          textColor: 'text-gray-400',
          bgColor: 'bg-gray-500',
        };
    }
  };

  const { borderColor, textColor, bgColor } = getStatusStyles();

  return (
    <div className={`relative aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden border-2 ${borderColor} transition-colors duration-500`}>
      {isLiveFeed ? (
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
        />
      ) : (
        <img 
            // FIX: The Student type does not have an 'email' property. Using the unique 'id' property for the avatar URL.
            src={`https://i.pravatar.cc/300?u=${student.id}`} 
            alt={student.name}
            className="w-full h-full object-cover" 
        />
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 backdrop-blur-sm">
        <p className="text-white text-sm font-medium truncate">{student.name}</p>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${bgColor}`}></div>
          <p className={`text-xs ${textColor} font-semibold`}>{status}</p>
        </div>
      </div>

       {isLiveFeed && (
        <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
        </div>
      )}
    </div>
  );
};

export default StudentCameraTile;
