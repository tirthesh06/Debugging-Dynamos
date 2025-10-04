import React, { useState } from 'react';
import Modal from './Modal';
import { User } from '../types';
import FaceScan from './FaceScan';
import QRCodeDisplay from './QRCodeDisplay';

interface AttendanceCheckinFlowProps {
  user: User;
  onClose: () => void;
  location: GeolocationCoordinates;
}

type Status = 
  | 'needs_face_scan'
  | 'display_qr';

const AttendanceCheckinFlow: React.FC<AttendanceCheckinFlowProps> = ({ user, onClose, location }) => {
  const [status, setStatus] = useState<Status>('needs_face_scan');

  const handleFaceScanSuccess = () => {
      setStatus('display_qr');
  };

  const renderContent = () => {
    switch (status) {
      case 'needs_face_scan':
        return (
            // FIX: Replaced unsupported `userEmail` prop with the required `registeredPhotoUrl` for login mode.
            <FaceScan
                mode="login"
                registeredPhotoUrl={user.registeredPhotoUrl}
                onSuccess={handleFaceScanSuccess}
                onClose={onClose}
                title="Attendance Verification"
            />
        );
      case 'display_qr':
        return <QRCodeDisplay user={user} location={location} />;
      default:
        return null;
    }
  };

  // The FaceScan component is a modal itself, so we don't wrap it in our Modal component
  if (status === 'needs_face_scan') {
    return renderContent();
  }

  return (
    <Modal title="Mark Attendance" onClose={onClose}>
      {renderContent()}
    </Modal>
  );
};

export default AttendanceCheckinFlow;
