
import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ParentDashboard from './components/ParentDashboard';
import { BackgroundGradient } from './components/ui/BackgroundGradient';
import useLocalStorage from './hooks/useLocalStorage';
import { User, UserRole, Student, LearningPath, LeaveApplication, AttendanceRecord, Exam, ExamSubmission } from './types';
import { MOCK_USERS, MOCK_STUDENTS, MOCK_EXAMS } from './data/mockData';
import AttendanceWarningScreen from './components/AttendanceWarningScreen';
import useIdleTimer from './hooks/useIdleTimer';
import IdleTimeoutModal from './components/IdleTimeoutModal';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const IDLE_PROMPT_MS = 1 * 60 * 1000;  // 1 minute before timeout

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users-list', MOCK_USERS);
  const [students, setStudents] = useLocalStorage<Student[]>('students-list', MOCK_STUDENTS);
  const [leaveApplications, setLeaveApplications] = useLocalStorage<LeaveApplication[]>('leave-applications', []);
  const [exams, setExams] = useLocalStorage<Exam[]>('exams-list', MOCK_EXAMS);
  const [examSubmissions, setExamSubmissions] = useLocalStorage<ExamSubmission[]>('exam-submissions', []);

  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isIdlePromptVisible, setIsIdlePromptVisible] = useState(false);
  
  // State to ensure data from localStorage is validated before rendering the app
  const [isDataValidated, setIsDataValidated] = useState(false);

  // This effect validates data loaded from localStorage on startup.
  // It prevents crashes from corrupted data (e.g., an object where an array is expected).
  useEffect(() => {
    let dataWasCorrupted = false;
    
    if (!Array.isArray(users)) {
      console.warn("Corrupted 'users' data in localStorage. Resetting.");
      setUsers(MOCK_USERS);
      dataWasCorrupted = true;
    }
    if (!Array.isArray(students)) {
      console.warn("Corrupted 'students' data in localStorage. Resetting.");
      setStudents(MOCK_STUDENTS);
      dataWasCorrupted = true;
    }
    if (!Array.isArray(leaveApplications)) {
      console.warn("Corrupted 'leaveApplications' data in localStorage. Resetting.");
      setLeaveApplications([]);
      dataWasCorrupted = true;
    }
    if (!Array.isArray(exams)) {
      console.warn("Corrupted 'exams' data in localStorage. Resetting.");
      setExams(MOCK_EXAMS);
      dataWasCorrupted = true;
    }
    if (!Array.isArray(examSubmissions)) {
      console.warn("Corrupted 'examSubmissions' data in localStorage. Resetting.");
      setExamSubmissions([]);
      dataWasCorrupted = true;
    }

    if (dataWasCorrupted) {
        // If data was reset, it's safer to log the user out to start fresh.
        setCurrentUser(null);
    }
    
    setIsDataValidated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect MUST run only once on initial load.
  
  // This effect acts as a one-time data migration to ensure the
  // default student user has face scan enabled, addressing cases
  // where older data might be stored in localStorage.
  useEffect(() => {
    // We read directly from localStorage to check the persisted data.
    const usersData = window.localStorage.getItem('users-list');
    if (usersData) {
      try {
        const storedUsers: User[] = JSON.parse(usersData);
        let needsUpdate = false;
        
        const updatedUsers = storedUsers.map(user => {
          // Specifically target 'student@school.com'
          if (user.email === 'student@school.com') {
            // If the property is missing or explicitly set to false, update it.
            if (user.enableScanOnLogin !== true) {
              needsUpdate = true;
              return { ...user, enableScanOnLogin: true };
            }
          }
          return user;
        });

        if (needsUpdate) {
          console.log("Migrating user data: Face scan on login has been enabled for student@school.com.");
          // This will trigger useLocalStorage to update the state and persist the change.
          setUsers(updatedUsers);
        }
      } catch (e) {
        console.error("Failed to parse or migrate user data from localStorage:", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on app startup to avoid re-running.


  const clearAuthError = () => setAuthError(null);

  // Effect to automatically block students with low attendance upon login.
  // This only adds a block reason; it never automatically unblocks a student.
  useEffect(() => {
    if (currentUser?.role === UserRole.Student) {
        const studentIndex = students.findIndex(s => s.id === currentUser.id);
        if (studentIndex === -1) return;
        
        const studentData = students[studentIndex];
        const totalClasses = studentData.attendance.length;
        const presentClasses = studentData.attendance.filter(a => a.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;
        const isLowAttendance = attendancePercentage < 75;

        if (isLowAttendance) {
            let needsUpdate = false;
            const updatedStudent = { ...studentData };
            
            if (!updatedStudent.isAccessBlocked) {
                updatedStudent.isAccessBlocked = true;
                updatedStudent.blockReason = 'Low Attendance';
                needsUpdate = true;
            } else if (updatedStudent.blockReason === 'Behaviour Issue') {
                updatedStudent.blockReason = 'Attendance & Behaviour';
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                const newStudents = [...students];
                newStudents[studentIndex] = updatedStudent;
                setStudents(newStudents);
            }
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Run ONLY on login to prevent loops
  
  const handleLogout = useCallback(() => {
    setIsIdlePromptVisible(false);
    setCurrentUser(null);
  }, [setCurrentUser]);

  const { reset: resetIdleTimer } = useIdleTimer({
    onIdle: handleLogout,
    onPrompt: () => setIsIdlePromptVisible(true),
    idleTime: IDLE_TIMEOUT_MS,
    promptTime: IDLE_PROMPT_MS,
    isEnabled: !!currentUser, // Only run the timer when a user is logged in
  });

  const handleStayLoggedIn = () => {
    setIsIdlePromptVisible(false);
    resetIdleTimer();
  };


  const handleLogin = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setAuthError(null);
    } else {
      setAuthError('Invalid email or password.');
    }
  };
  
  const handleSocialLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setAuthError(null);
    } else {
      setAuthError(`No mock user found for role: ${role}`);
    }
  }

  const handleProviderLogin = (identifier: string, type: 'email' | 'mobile') => {
    const user = type === 'email'
      ? users.find(u => u.email === identifier)
      : users.find(u => u.mobile === identifier);

    if (user) {
      setCurrentUser(user);
      setAuthError(null);
    } else {
      setAuthError('User not found.');
    }
  };

  const handleSignup = (details: { name: string, email: string, role: UserRole, password: string, childEmail?: string, registeredPhotoUrl: string }) => {
    if (users.find(u => u.email === details.email)) {
      setAuthError('An account with this email already exists.');
      setIsLoginView(true);
      return;
    }
    
    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: details.name,
      email: details.email,
      role: details.role,
      password: details.password,
      registeredPhotoUrl: details.registeredPhotoUrl,
      enableScanOnLogin: true, // Enable by default for all users for enhanced security
    };

    if (newUser.role === UserRole.Student) {
      // Create a new student with some default mock data for a better demo experience
      const defaultStudentDataTemplate = MOCK_STUDENTS[0];
      const newStudent: Student = {
        id: newUser.id,
        name: newUser.name,
        rollNumber: `S${Math.floor(Math.random() * 900) + 100}`,
        department: defaultStudentDataTemplate.department,
        attendance: [], // Start with empty attendance
        learningPath: null,
        isAccessBlocked: false,
        behaviourStatus: 'Good',
        blockReason: null,
        progress: [],
      };
      setStudents([...students, newStudent]);
    } else if (newUser.role === UserRole.Parent) {
      if (!details.childEmail) {
        setAuthError("Please provide your child's email to create a parent account.");
        return;
      }
      const childUser = users.find(u => u.email === details.childEmail && u.role === UserRole.Student);
      if (!childUser) {
        setAuthError(`No student account found with the email: ${details.childEmail}. Please verify the email.`);
        return;
      }
      // Link parent to child
      newUser.childId = childUser.id;
    }
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setAuthError(null);
  };


  const handleUpdateUser = (updatedUser: User) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsers);
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };
  
  const handleApplyForLeave = (applicationData: Omit<LeaveApplication, 'id' | 'status' | 'applicationDate'>) => {
    const newApplication: LeaveApplication = {
      ...applicationData,
      id: `leave-${Date.now()}`,
      status: 'Pending',
      applicationDate: new Date().toISOString(),
    };
    setLeaveApplications(prev => [...prev, newApplication]);
  };

  const handleUpdateLeaveStatus = (applicationId: string, status: 'Approved' | 'Rejected', teacherComment?: string) => {
    const applicationIndex = leaveApplications.findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) return;

    const application = leaveApplications[applicationIndex];
    const updatedApplication = { ...application, status, teacherComment };

    const newApplications = [...leaveApplications];
    newApplications[applicationIndex] = updatedApplication;
    setLeaveApplications(newApplications);

    // If leave is approved, update the student's attendance record.
    if (status === 'Approved') {
        const studentIndex = students.findIndex(s => s.id === application.studentId);
        if (studentIndex === -1) return;

        const studentToUpdate = { ...students[studentIndex] };
        let newAttendanceRecords: AttendanceRecord[] = [...studentToUpdate.attendance];
        
        const teacher = users.find(u => u.role === UserRole.Teacher);
        
        // FIX: Use UTC date parsing and iteration for robustness against timezones.
        const startDate = new Date(application.startDate + 'T00:00:00Z');
        const endDate = new Date(application.endDate + 'T00:00:00Z');
        
        for (let d = startDate; d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const hasLeaveRecordForDay = newAttendanceRecords.some(
                rec => rec.date === dateString && rec.subject === 'On Approved Leave'
            );

            // Add a special attendance record to mark the approved leave
            if (!hasLeaveRecordForDay) {
                const leaveRecord: AttendanceRecord = {
                    date: dateString,
                    subject: 'On Approved Leave',
                    teacherName: teacher?.name || 'System',
                    timestamp: 'All Day',
                    status: 'Present',
                };
                newAttendanceRecords.push(leaveRecord);
            }
        }

        studentToUpdate.attendance = newAttendanceRecords;
        const newStudents = [...students];
        newStudents[studentIndex] = studentToUpdate;
        setStudents(newStudents);
    }
  };

  const handleSaveExam = (examToSave: Exam) => {
    const index = exams.findIndex(e => e.id === examToSave.id);
    if (index > -1) {
      const newExams = [...exams];
      newExams[index] = examToSave;
      setExams(newExams);
    } else {
      setExams([...exams, examToSave]);
    }
  };

  const handleDeleteExam = (examId: string) => {
    setExams(exams.filter(e => e.id !== examId));
    // Also delete related submissions
    setExamSubmissions(examSubmissions.filter(s => s.examId !== examId));
  };

  const handleSubmitExam = (submission: Omit<ExamSubmission, 'id' | 'score' | 'studentName'>) => {
    const exam = exams.find(e => e.id === submission.examId);
    // BUG FIX: Add checks for exam, current user, and if questions is a valid array to prevent crashes.
    if (!exam || !currentUser || !Array.isArray(exam.questions)) {
      console.error("Exam submission failed: Invalid exam data.");
      return;
    }

    let correctAnswers = 0;
    exam.questions.forEach(q => {
      if (q.correctAnswer === submission.answers[q.id]) {
        correctAnswers++;
      }
    });
    
    // BUG FIX: Handle division by zero if an exam has no questions.
    const score = exam.questions.length > 0
      ? (correctAnswers / exam.questions.length) * 100
      : 0;

    const newSubmission: ExamSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      studentName: currentUser.name,
      score: Math.round(score),
    };
    
    setExamSubmissions([...examSubmissions, newSubmission]);
  };

  const handleDeleteSubmission = (submissionId: string) => {
    setExamSubmissions(prev => prev.filter(s => s.id !== submissionId));
  };


  const renderDashboard = () => {
    if (!currentUser) return null;

    if (currentUser.role === UserRole.Student) {
        const studentData = students.find(s => s.id === currentUser.id);
        if (studentData) {
          const hasActivePass = studentData.temporaryAccessExpires && studentData.temporaryAccessExpires > Date.now();
          if (studentData.isAccessBlocked && !hasActivePass) {
            return <AttendanceWarningScreen onLogout={handleLogout} />;
          }
        }
    }

    switch (currentUser.role) {
      case UserRole.Teacher:
        return <TeacherDashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            students={students} 
            setStudents={setStudents} 
            onUpdateUser={handleUpdateUser} 
            leaveApplications={leaveApplications}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            exams={exams.filter(e => e.createdBy === currentUser.id)}
            examSubmissions={examSubmissions}
            onSaveExam={handleSaveExam}
            onDeleteExam={handleDeleteExam}
            onDeleteSubmission={handleDeleteSubmission}
        />;
      case UserRole.Student:
        const studentData = students.find(s => s.id === currentUser.id);
        if (!studentData) {
            return (
              <div className="flex flex-col items-center justify-center h-screen text-white">
                <h2 className="text-2xl text-red-400">Error: Could not load student data.</h2>
                <p className="text-gray-400">Please try logging out and back in, or contact support.</p>
                <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 rounded">Logout</button>
              </div>
            );
        }
        return <StudentDashboard
            user={currentUser}
            onLogout={handleLogout}
            studentData={studentData}
            onPlanUpdate={(learningPath) => {
                setStudents(students.map(s => s.id === currentUser.id ? { ...s, learningPath } : s));
            }}
            onUpdateUser={handleUpdateUser}
            leaveApplications={leaveApplications.filter(app => app.studentId === currentUser.id)}
            onApplyForLeave={handleApplyForLeave}
            exams={exams}
            examSubmissions={examSubmissions.filter(s => s.studentId === currentUser.id)}
            onSubmitExam={handleSubmitExam}
        />;
      case UserRole.Parent:
         const childData = students.find(s => s.id === currentUser.childId);
        if (!childData) {
            return (
              <div className="flex flex-col items-center justify-center h-screen text-white">
                <h2 className="text-2xl text-red-400">Error: Could not find linked child data.</h2>
                <p className="text-gray-400">Please contact support to link your account to your child.</p>
                <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 rounded">Logout</button>
              </div>
            );
        }
        return <ParentDashboard user={currentUser} onLogout={handleLogout} childData={childData} onUpdateUser={handleUpdateUser} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl text-red-400">Error: Unknown user role.</h2>
            <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 rounded">Logout</button>
          </div>
        );
    }
  };

  if (!isDataValidated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white mt-4">Initializing Application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 font-sans">
       <IdleTimeoutModal
        isOpen={isIdlePromptVisible}
        onClose={handleStayLoggedIn}
        onLogout={handleLogout}
        countdownTime={IDLE_PROMPT_MS}
      />
      <BackgroundGradient>
        {currentUser ? (
          renderDashboard()
        ) : isLoginView ? (
          <LoginScreen
            onLogin={handleLogin}
            onSwitchToSignup={() => { setIsLoginView(false); setAuthError(null); }}
            onProviderLogin={handleProviderLogin}
            error={authError}
            onClearError={clearAuthError}
            users={users}
          />
        ) : (
          <SignupScreen
            onSignup={handleSignup}
            onSwitchToLogin={() => { setIsLoginView(true); setAuthError(null); }}
            onSocialLogin={handleSocialLogin}
            error={authError}
          />
        )}
      </BackgroundGradient>
    </div>
  );
};

export default App;
