import React from 'react';
import { AttendanceRecord } from '../types';

interface RollAccountViewProps {
  attendance: AttendanceRecord[];
}

const RollAccountView: React.FC<RollAccountViewProps> = ({ attendance }) => {
  // Sort records by date (most recent first)
  const sortedAttendance = [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h3 className="text-2xl font-bold mb-4 text-indigo-400">Complete Attendance History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="p-3 text-sm font-semibold tracking-wide">Date</th>
              <th className="p-3 text-sm font-semibold tracking-wide">Subject/Class</th>
              <th className="p-3 text-sm font-semibold tracking-wide">Teacher</th>
              <th className="p-3 text-sm font-semibold tracking-wide">Timestamp</th>
              <th className="p-3 text-sm font-semibold tracking-wide text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedAttendance.map((record, index) => (
              <tr key={`${record.date}-${record.subject}-${index}`} className="hover:bg-gray-700/50">
                <td className="p-3 text-sm text-gray-300 whitespace-nowrap">
                  {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-3 text-sm text-white whitespace-nowrap">{record.subject}</td>
                <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{record.teacherName}</td>
                <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{record.timestamp}</td>
                <td className="p-3 text-sm text-right whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    record.status === 'Present' ? 'bg-green-600/50 text-green-200' :
                    record.status === 'Absent' ? 'bg-red-600/50 text-red-200' :
                    'bg-yellow-600/50 text-yellow-200'
                  }`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAttendance.length === 0 && (
          <p className="text-center py-8 text-gray-400">No attendance records found.</p>
        )}
      </div>
    </div>
  );
};

export default RollAccountView;
