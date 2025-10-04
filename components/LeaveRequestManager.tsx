import React, { useState, useMemo } from 'react';
import { LeaveApplication } from '../types';

interface LeaveRequestManagerProps {
  leaveApplications: LeaveApplication[];
  onUpdateLeaveStatus: (applicationId: string, status: 'Approved' | 'Rejected', teacherComment?: string) => void;
}

const LeaveRequestManager: React.FC<LeaveRequestManagerProps> = ({ leaveApplications, onUpdateLeaveStatus }) => {
  const [activeTab, setActiveTab] = useState<'Pending' | 'All'>('Pending');

  const filteredApplications = useMemo(() => {
    const sorted = [...leaveApplications].sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
    if (activeTab === 'Pending') {
      return sorted.filter(app => app.status === 'Pending');
    }
    return sorted;
  }, [leaveApplications, activeTab]);

  const getStatusChipClass = (status: LeaveApplication['status']) => {
    switch (status) {
      case 'Approved': return 'bg-green-600/50 text-green-200';
      case 'Rejected': return 'bg-red-600/50 text-red-200';
      case 'Pending': return 'bg-yellow-600/50 text-yellow-200';
      default: return 'bg-gray-600/50 text-gray-200';
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-indigo-400">Manage Leave Requests</h2>
      
      <div className="border-b border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('Pending')}
            className={`tab-button py-2 px-1 font-medium text-sm ${activeTab === 'Pending' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('All')}
            className={`tab-button py-2 px-1 font-medium text-sm ${activeTab === 'All' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          >
            All Requests
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Dates</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? filteredApplications.map(app => (
              <tr key={app.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-3 align-top">
                  <div className="font-medium text-white">{app.studentName}</div>
                  <div className="text-xs text-gray-400">{app.studentRollNumber}</div>
                </td>
                <td className="p-3 align-top text-sm text-gray-300">
                  {new Date(app.startDate).toLocaleDateString()} - {new Date(app.endDate).toLocaleDateString()}
                </td>
                <td className="p-3 align-top">
                  <p className="text-sm text-gray-300 max-w-xs">{app.reason}</p>
                   {app.documentUrl && (
                     <a href={app.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-indigo-400 hover:underline">View Document</a>
                 )}
                </td>
                <td className="p-3 align-top">
                  {app.status === 'Pending' ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button onClick={() => onUpdateLeaveStatus(app.id, 'Approved')} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Approve</button>
                      <button onClick={() => onUpdateLeaveStatus(app.id, 'Rejected')} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Reject</button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(app.status)}`}>
                      {app.status}
                    </span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-400">
                  {activeTab === 'Pending' ? 'No pending leave requests.' : 'No leave applications found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequestManager;