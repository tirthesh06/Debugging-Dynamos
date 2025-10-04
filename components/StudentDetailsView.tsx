import React from 'react';
import { Student, LearningPath } from '../types';
import Modal from './Modal';
import RollAccountView from './RollAccountView';
import LearningPathGenerator from './LearningPathGenerator';
import LearningPathView from './LearningPathView';
import LearningStrategies from './LearningStrategies';

interface StudentDetailsViewProps {
  student: Student;
  onClose: () => void;
  onPlanGenerated: (learningPath: LearningPath) => void;
}

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ student, onClose, onPlanGenerated }) => {
  const totalClasses = student.attendance.length;
  const presentClasses = student.attendance.filter(a => a.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

  return (
    <Modal title={`Student Details: ${student.name}`} onClose={onClose}>
      <div className="space-y-6 p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Roll Number</p>
                <p className="text-lg font-semibold text-white">{student.rollNumber}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Department</p>
                <p className="text-lg font-semibold text-white">{student.department}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Attendance</p>
                <p className="text-lg font-semibold text-white">{attendancePercentage.toFixed(1)}% ({presentClasses}/{totalClasses})</p>
            </div>
        </div>

        <LearningStrategies student={student} />
        
        {student.learningPath && <LearningPathView learningPath={student.learningPath} />}
        
        <LearningPathGenerator student={student} onPlanGenerated={onPlanGenerated} />
        
        <RollAccountView attendance={student.attendance} />

      </div>
    </Modal>
  );
};

export default StudentDetailsView;
