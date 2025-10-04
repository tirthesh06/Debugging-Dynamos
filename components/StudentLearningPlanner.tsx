
import React, { useState, useEffect } from 'react';
import { Student, LearningPath } from '../types';
import { generateStudentInitiatedLearningPath } from '../services/geminiService';
import Spinner from './Spinner';
import LearningPathView from './LearningPathView';

interface StudentLearningPlannerProps {
  student: Student;
  onPlanGenerated: (learningPath: LearningPath) => void;
}

type PlannerState = 'welcome' | 'form' | 'generating' | 'viewing' | 'error';

const StudentLearningPlanner: React.FC<StudentLearningPlannerProps> = ({ student, onPlanGenerated }) => {
  const [plannerState, setPlannerState] = useState<PlannerState>('welcome');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subjects: '',
    examDates: '',
    studyHours: '',
    strengthsWeaknesses: '',
    goal: '',
  });

  useEffect(() => {
    if (student.learningPath) {
      setPlannerState('viewing');
    } else {
      setPlannerState('welcome');
    }
  }, [student.learningPath]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlannerState('generating');
    setError(null);

    const path = await generateStudentInitiatedLearningPath(formData, student.name);

    if (path) {
      onPlanGenerated(path);
      // The useEffect will switch the state to 'viewing'
    } else {
      setError('Sorry, I couldn\'t generate a plan right now. Please check your inputs or try again later.');
      setPlannerState('error');
    }
  };
  
  const renderWelcome = () => (
    <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
      <h3 className="text-3xl font-bold text-white">Hey {student.name}! 👋</h3>
      <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
        I'm your Personal AI Study Partner. I can create a perfect study plan based on your subjects and goals to make learning easier and more interesting. Ready to start?
      </p>
      <button 
        onClick={() => setPlannerState('form')}
        className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
      >
        Create My Plan
      </button>
    </div>
  );
  
  const renderForm = () => (
     <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl border border-gray-700">
        <h3 className="text-2xl font-bold text-center mb-6 text-white">Tell me a little about your studies</h3>
        <form onSubmit={handleGeneratePlan} className="space-y-6 max-w-2xl mx-auto">
           <div>
              <label htmlFor="subjects" className="block text-sm font-medium text-gray-300 mb-2">What subjects are you studying?</label>
              <input type="text" name="subjects" id="subjects" value={formData.subjects} onChange={handleInputChange} required placeholder="e.g., Physics, Maths, History" className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" />
           </div>
           <div>
              <label htmlFor="examDates" className="block text-sm font-medium text-gray-300 mb-2">When are your next exams?</label>
              <input type="text" name="examDates" id="examDates" value={formData.examDates} onChange={handleInputChange} required placeholder="e.g., Next month, or specific dates" className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" />
           </div>
           <div>
              <label htmlFor="studyHours" className="block text-sm font-medium text-gray-300 mb-2">How many hours can you study per day?</label>
              <input type="text" name="studyHours" id="studyHours" value={formData.studyHours} onChange={handleInputChange} required placeholder="e.g., 3 hours on weekdays, 5 on weekends" className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" />
           </div>
           <div>
              <label htmlFor="strengthsWeaknesses" className="block text-sm font-medium text-gray-300 mb-2">What are your strongest and weakest subjects/topics?</label>
              <textarea name="strengthsWeaknesses" id="strengthsWeaknesses" value={formData.strengthsWeaknesses} onChange={handleInputChange} required rows={3} placeholder="e.g., Strong in Algebra, weak in Geometry" className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"></textarea>
           </div>
           <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">What is your main goal?</label>
              <input type="text" name="goal" id="goal" value={formData.goal} onChange={handleInputChange} required placeholder="e.g., Score 90% in finals, clear concepts" className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white" />
           </div>
           <div className="text-center pt-4">
               <button type="submit" className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  ✨ Generate My Personalized Plan
               </button>
           </div>
        </form>
     </div>
  );
  
  const renderGenerating = () => (
    <div className="text-center py-24 bg-gray-800/50 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
        <Spinner />
        <h3 className="text-2xl font-bold text-white mt-6">Crafting your personalized plan...</h3>
        <p className="text-gray-300 mt-2">Hang tight, this might take a moment!</p>
    </div>
  );

  const renderViewing = () => (
     <div>
        {student.learningPath && <LearningPathView learningPath={student.learningPath} />}
        <div className="mt-6 text-center">
            <button 
              onClick={() => { setFormData({subjects: '', examDates: '', studyHours: '', strengthsWeaknesses: '', goal: ''}); setPlannerState('form'); }}
              className="px-6 py-2 font-semibold text-indigo-400 bg-gray-900/50 border border-indigo-500/50 rounded-lg hover:bg-gray-700/50"
            >
              Create a New Plan
            </button>
        </div>
     </div>
  );
  
  const renderError = () => (
     <div className="text-center py-12 bg-red-900/30 rounded-xl border border-red-500/50">
      <h3 className="text-2xl font-bold text-red-300">Oh no! Something went wrong.</h3>
      <p className="text-red-300/80 mt-2 max-w-md mx-auto">{error}</p>
      <button 
        onClick={() => setPlannerState('form')}
        className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        Try Again
      </button>
    </div>
  );

  switch (plannerState) {
    case 'welcome':
      return renderWelcome();
    case 'form':
      return renderForm();
    case 'generating':
      return renderGenerating();
    case 'viewing':
      return renderViewing();
    case 'error':
        return renderError();
    default:
      return renderWelcome();
  }
};

export default StudentLearningPlanner;
