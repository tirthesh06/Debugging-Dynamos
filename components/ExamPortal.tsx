import React, { useState } from 'react';
import { Exam, ExamSubmission } from '../types';
import ExamTaker from './ExamTaker';
import AnimatedElement from './AnimatedElement';
import Modal from './Modal';

interface ExamPortalProps {
  studentId: string;
  exams: Exam[];
  submissions: ExamSubmission[];
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'score' | 'studentName'>) => void;
}

const ExamPortal: React.FC<ExamPortalProps> = ({ studentId, exams, submissions, onSubmitExam }) => {
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [confirmingExam, setConfirmingExam] = useState<Exam | null>(null);

  // FIX: Explicitly type the Map to ensure correct type inference for `submission`.
  const studentSubmissionsMap = new Map<string, ExamSubmission>(submissions.map(s => [s.examId, s]));

  const handleSubmit = (answers: { [questionId: string]: string }, status: 'Completed' | 'Blocked') => {
    if (!takingExam) return;
    onSubmitExam({
      examId: takingExam.id,
      studentId,
      answers,
      submittedAt: Date.now(),
      status,
    });
    setTakingExam(null);
  };

  if (takingExam) {
    // A student cannot retake a blocked exam unless the teacher allows it (by deleting the submission).
    const existingSubmission = studentSubmissionsMap.get(takingExam.id);
    if (existingSubmission?.status === 'Blocked') {
        return (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-red-500/50 text-center">
                 <h2 className="text-2xl font-bold mb-4 text-red-400">Exam Blocked</h2>
                 <p className="text-gray-300">Your access to this exam has been blocked due to a violation of exam rules.</p>
                 <p className="text-gray-400 mt-2">Please contact your teacher for assistance.</p>
                 <button onClick={() => setTakingExam(null)} className="mt-6 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Go Back</button>
            </div>
        );
    }
    return <ExamTaker exam={takingExam} onClose={() => setTakingExam(null)} onSubmit={handleSubmit} />;
  }

  return (
    <>
      {confirmingExam && (
        <Modal title="Exam Rules & Instructions" onClose={() => setConfirmingExam(null)}>
            <div className="p-4 text-gray-300 space-y-4">
                <h3 className="text-xl font-bold text-yellow-300 text-center">Please Read Carefully Before Starting</h3>
                <p>This is a secured exam environment. To ensure fairness and integrity, the following rules are strictly enforced:</p>
                <ul className="list-disc list-inside space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <li><strong className="text-white">No Tab Switching:</strong> If you leave this exam tab or switch to another application, you will receive <strong className="text-yellow-400">one warning</strong>. A second attempt will cause the exam to be <strong className="text-red-400">automatically submitted and blocked</strong>.</li>
                    <li><strong className="text-white">Copy/Paste Disabled:</strong> You cannot copy questions or paste answers from external sources. All answers must be typed directly.</li>
                    <li><strong className="text-white">Right-Click Disabled:</strong> The right-click context menu is disabled on this page.</li>
                    <li><strong className="text-white">Auto-Submit on Timeout:</strong> The exam will automatically submit when the timer runs out.</li>
                </ul>
                <p className="text-center font-semibold">By starting the exam, you agree to abide by these rules.</p>
                <div className="flex justify-center gap-4 pt-4">
                    <button onClick={() => setConfirmingExam(null)} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
                    <button 
                        onClick={() => {
                            setTakingExam(confirmingExam);
                            setConfirmingExam(null);
                        }}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                    >
                        I Understand, Start Exam
                    </button>
                </div>
            </div>
        </Modal>
      )}

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-indigo-400">Exam Portal</h2>
        {exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam, index) => {
              const submission = studentSubmissionsMap.get(exam.id);
              const isBlocked = submission?.status === 'Blocked';
              return (
                <AnimatedElement key={exam.id} delay={index * 100}>
                  <div className={`bg-gray-900/50 p-6 rounded-lg border flex flex-col justify-between h-full ${isBlocked ? 'border-red-500/50' : 'border-gray-700'}`}>
                    <div>
                      <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                      <p className="text-sm text-gray-400">{exam.subject}</p>
                      <div className="flex gap-4 text-sm mt-2 text-gray-300">
                          <span>Questions: {exam.questions?.length || 0}</span>
                          <span>Duration: {exam.durationMinutes} mins</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      {submission ? (
                        <div className={`text-center p-4 rounded-lg border ${isBlocked ? 'bg-red-900/50 border-red-500/50' : 'bg-green-900/50 border-green-500/50'}`}>
                          <p className={`text-sm ${isBlocked ? 'text-red-300' : 'text-green-300'}`}>{isBlocked ? 'Blocked' : 'Completed'}</p>
                          <p className="text-3xl font-bold text-white">{submission.score}%</p>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmingExam(exam)}
                          className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
                        >
                          Take Exam
                        </button>
                      )}
                    </div>
                  </div>
                </AnimatedElement>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No exams are available at this moment.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ExamPortal;