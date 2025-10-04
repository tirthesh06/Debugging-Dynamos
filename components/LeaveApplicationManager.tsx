import React, { useState, useMemo } from 'react';
import { Student, LeaveApplication } from '../types';
import Modal from './Modal';

interface LeaveApplicationManagerProps {
  student: Student;
  applications: LeaveApplication[];
  onApplyForLeave: (applicationData: Omit<LeaveApplication, 'id' | 'status' | 'applicationDate'>) => void;
}

const LeaveApplicationManager: React.FC<LeaveApplicationManagerProps> = ({ student, applications, onApplyForLeave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    documentUrl: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFormData({ ...formData, documentUrl: loadEvent.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setError('Start date, end date, and reason are required.');
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setError('Start date cannot be after the end date.');
        return;
    }

    onApplyForLeave({
      studentId: student.id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      ...formData
    });
    setIsModalOpen(false);
  };
  
  const getStatusChipClass = (status: LeaveApplication['status']) => {
    switch (status) {
      case 'Approved': return 'bg-green-600/50 text-green-200';
      case 'Rejected': return 'bg-red-600/50 text-red-200';
      case 'Pending': return 'bg-yellow-600/50 text-yellow-200';
      default: return 'bg-gray-600/50 text-gray-200';
    }
  };
  
  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
  }, [applications]);

  return (
    <>
      {isModalOpen && (
        <Modal title="Apply for Leave" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="p-2 space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" />
                </div>
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">Reason for Leave</label>
              <textarea id="reason" name="reason" value={formData.reason} onChange={handleInputChange} rows={4} required className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" placeholder="e.g., Family function, medical appointment..."></textarea>
            </div>
             <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-300 mb-1">Supporting Document (Optional)</label>
              <input type="file" id="document" name="document" onChange={handleFileChange} accept="image/*,.pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/50 file:text-indigo-200 hover:file:bg-indigo-700/50" />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">Submit Application</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-indigo-400">My Leave Applications</h2>
          <button onClick={() => { setIsModalOpen(true); setError(''); setFormData({startDate: '', endDate: '', reason: '', documentUrl: ''}) }} className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
            + Apply for New Leave
          </button>
        </div>
        
        {sortedApplications.length > 0 ? (
          <div className="space-y-4">
            {sortedApplications.map(app => (
              <div key={app.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                        <p className="font-semibold text-white">
                            Leave from {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-400">Applied on: {new Date(app.applicationDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(app.status)}`}>
                        {app.status}
                    </span>
                </div>
                 <p className="mt-3 text-sm text-gray-300 border-l-2 border-gray-600 pl-3"><strong>Reason:</strong> {app.reason}</p>
                 {app.documentUrl && (
                     <a href={app.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-indigo-400 hover:underline">View Attached Document</a>
                 )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>You have not submitted any leave applications yet.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveApplicationManager;