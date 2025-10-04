import React, { useMemo } from 'react';
import { Student } from '../types';

interface StudentAccessManagerProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const StudentAccessManager: React.FC<StudentAccessManagerProps> = ({ students, setStudents }) => {
  
  const studentDataWithStats = useMemo(() => {
    return students.map(student => {
      const totalClasses = student.attendance.length;
      const presentClasses = student.attendance.filter(a => a.status === 'Present').length;
      const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;
      const hasActivePass = student.temporaryAccessExpires && student.temporaryAccessExpires > Date.now();
      return {
        ...student,
        attendancePercentage,
        hasActivePass,
      };
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [students]);

  const handleBehaviourChange = (studentId: string, newStatus: 'Good' | 'Needs Improvement') => {
    setStudents(students.map(s => s.id === studentId ? { ...s, behaviourStatus: newStatus } : s));
  };

  const handleGrantTemporaryAccess = (studentId: string) => {
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    setStudents(students.map(s =>
      s.id === studentId ? { ...s, temporaryAccessExpires: expires } : s
    ));
  };
  
  const handleToggleAccess = (studentId: string) => {
    const student = studentDataWithStats.find(s => s.id === studentId);
    if (!student) return;

    if (student.isAccessBlocked) {
      // Unblocking a student is a full reset action
      setStudents(students.map(s => 
        s.id === studentId ? { 
          ...s, 
          isAccessBlocked: false, 
          blockReason: null, 
          behaviourStatus: 'Good',
          temporaryAccessExpires: undefined, // Also clear any temporary pass
        } : s
      ));
    } else {
      // Manually blocking a student. The reason is always related to behavior.
      // The system will add the 'Attendance' flag automatically if relevant.
      const isLowAttendance = student.attendancePercentage < 75;
      const newReason = isLowAttendance ? 'Attendance & Behaviour' : 'Behaviour Issue';
      
      setStudents(students.map(s => 
        s.id === studentId ? { 
          ...s, 
          isAccessBlocked: true, 
          blockReason: newReason,
          behaviourStatus: 'Needs Improvement' // Forcibly set behavior to needs improvement on manual block
        } : s
      ));
    }
  };
  
  const getAccessStatusChip = (student: typeof studentDataWithStats[0]) => {
      if (student.hasActivePass) {
          return (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-600/50 text-purple-200">
                  Temp. Access
              </span>
          );
      }
      return (
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            student.isAccessBlocked 
              ? 'bg-red-600/50 text-red-200' 
              : 'bg-green-600/50 text-green-200'
          }`}>
            {student.isAccessBlocked ? 'Blocked' : 'Active'}
          </span>
      );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-indigo-400">Manage Student Access</h2>
      <p className="text-sm text-gray-400 mb-6">
        Monitor student attendance and behavior. For blocked students, you can grant a temporary 24-hour pass as a fallback for technical issues.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left align-middle">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Attendance %</th>
              <th className="p-3">Behaviour Status</th>
              <th className="p-3">Access Status</th>
              <th className="p-3">Reason for Block</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentDataWithStats.map(student => (
              <tr key={student.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                <td className="p-3">
                  <div className="font-medium text-white">{student.name}</div>
                  <div className="text-xs text-gray-400">{student.rollNumber}</div>
                </td>
                <td className={`p-3 font-bold text-lg ${student.attendancePercentage < 75 ? 'text-red-400' : 'text-green-400'}`}>
                  {student.attendancePercentage.toFixed(1)}%
                </td>
                <td className="p-3">
                   <select
                      value={student.behaviourStatus}
                      onChange={(e) => handleBehaviourChange(student.id, e.target.value as 'Good' | 'Needs Improvement')}
                      className={`w-40 appearance-none text-center text-xs font-semibold rounded-full px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors ${
                        student.behaviourStatus === 'Good' 
                          ? 'bg-blue-600/50 text-blue-200 border border-blue-500/50'
                          : 'bg-yellow-600/50 text-yellow-200 border border-yellow-500/50'
                      }`}
                    >
                      <option className="bg-gray-700 text-white" value="Good">Good</option>
                      <option className="bg-gray-700 text-white" value="Needs Improvement">Needs Improvement</option>
                    </select>
                </td>
                <td className="p-3">
                  {getAccessStatusChip(student)}
                </td>
                <td className="p-3 text-sm text-gray-300">
                  {student.blockReason || '—'}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAccess(student.id)}
                      className={`px-4 py-1.5 w-24 text-sm font-semibold text-white rounded-lg transition-colors ${
                        student.isAccessBlocked
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {student.isAccessBlocked ? 'Unblock' : 'Block'}
                    </button>
                    {student.isAccessBlocked && (
                       <button
                        onClick={() => handleGrantTemporaryAccess(student.id)}
                        disabled={student.hasActivePass}
                        className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-colors bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        title={student.hasActivePass ? "Student already has an active pass" : "Grant 24-hour access"}
                      >
                        Grant Pass
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAccessManager;