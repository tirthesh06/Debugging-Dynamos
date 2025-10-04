
import { User, UserRole, Student, AssignmentStatus, Exam, Mentor } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Teacher Alice',
    email: 'teacher@school.com',
    role: UserRole.Teacher,
    password: 'password123',
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=teacher@school.com',
    enableScanOnLogin: true,
  },
  {
    id: 'user-2',
    name: 'Student Bob',
    email: 'student@school.com',
    role: UserRole.Student,
    password: 'password123',
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=student@school.com',
    enableScanOnLogin: true,
  },
  {
    id: 'user-3',
    name: 'Parent Carol',
    email: 'parent@school.com',
    role: UserRole.Parent,
    password: 'password123',
    childId: 'user-2',
    registeredPhotoUrl: 'https://i.pravatar.cc/300?u=parent@school.com',
    enableScanOnLogin: true,
  },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'user-2',
    name: 'Student Bob',
    rollNumber: 'S001',
    department: 'Computer Science',
    attendance: [
      { date: '2023-10-27', subject: 'Computer Graphics (CG)', teacherName: 'Teacher Alice', timestamp: '10:00 AM', status: 'Present' },
      { date: '2023-10-27', subject: 'District Mathematics Structure (DMS)', teacherName: 'Teacher Alice', timestamp: '12:00 PM', status: 'Present' },
      { date: '2023-10-26', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:00 AM', status: 'Present' },
      { date: '2023-10-26', subject: 'Algorithms', teacherName: 'Teacher Alice', timestamp: '11:00 AM', status: 'Present' },
      { date: '2023-10-25', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:05 AM', status: 'Absent' },
    ],
    learningPath: null,
    isAccessBlocked: false,
    behaviourStatus: 'Good',
    blockReason: null,
    progress: [
        {
            subjectName: 'Data Structures',
            overallGrade: 'A-',
            teacherFeedback: 'Excellent work on the recent assignments. Keep focusing on time complexity analysis.',
            assignments: [
                { id: 'ds-1', title: 'Lab 1: Arrays & Structs', dueDate: '2023-09-15', status: AssignmentStatus.Graded, score: 9, maxScore: 10, submittedDate: '2023-09-14' },
                { id: 'ds-2', title: 'Lab 2: Linked Lists', dueDate: '2023-09-22', status: AssignmentStatus.Graded, score: 8, maxScore: 10, submittedDate: '2023-09-22' },
                { id: 'ds-3', title: 'Mid-Term Project', dueDate: '2023-10-10', status: AssignmentStatus.Graded, score: 95, maxScore: 100, submittedDate: '2023-10-09' },
                { id: 'ds-4', title: 'Lab 3: Trees', dueDate: '2023-10-20', status: AssignmentStatus.Submitted, maxScore: 10 },
            ],
        },
        {
            subjectName: 'Algorithms',
            overallGrade: 'B+',
            teacherFeedback: 'Good understanding of core concepts, but be careful with edge cases in your implementations.',
            assignments: [
                { id: 'algo-1', title: 'Problem Set 1: Sorting', dueDate: '2023-09-18', status: AssignmentStatus.Graded, score: 8, maxScore: 10, submittedDate: '2023-09-18' },
                { id: 'algo-2', title: 'Problem Set 2: Recursion', dueDate: '2023-09-25', status: AssignmentStatus.Graded, score: 7, maxScore: 10, submittedDate: '2023-09-26' },
                { id: 'algo-3', title: 'Quiz 1', dueDate: '2023-10-12', status: AssignmentStatus.Graded, score: 88, maxScore: 100, submittedDate: '2023-10-12' },
                { id: 'algo-4', title: 'Problem Set 3: Graphs', dueDate: '2023-10-24', status: AssignmentStatus.Pending, maxScore: 10 },
            ],
        },
    ],
  },
  {
    id: 'user-4',
    name: 'Student David',
    rollNumber: 'S002',
    department: 'Computer Science',
    attendance: [
      { date: '2023-10-27', subject: 'Open Elective-IQM', teacherName: 'Teacher Alice', timestamp: '02:00 PM', status: 'Absent' },
      { date: '2023-10-26', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:00 AM', status: 'Absent' },
      { date: '2023-10-25', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:02 AM', status: 'Absent' },
      { date: '2023-10-24', subject: 'Data Structures', teacherName: 'Teacher Alice', timestamp: '09:02 AM', status: 'Absent' },
    ],
    learningPath: null,
    isAccessBlocked: false,
    behaviourStatus: 'Good',
    blockReason: null,
    progress: [],
  },
   {
    id: 'user-5',
    name: 'Student Eve',
    rollNumber: 'S003',
    department: 'Civil Engineering',
    attendance: [
       { date: '2023-10-27', subject: 'Civil GIS', teacherName: 'Teacher Frank', timestamp: '11:00 AM', status: 'Present' },
       { date: '2023-10-26', subject: 'Surveying', teacherName: 'Teacher Frank', timestamp: '01:00 PM', status: 'Present' },
       { date: '2023-10-25', subject: 'Circuit Theory', teacherName: 'Teacher Frank', timestamp: '10:00 AM', status: 'Present' },
    ],
    learningPath: null,
    isAccessBlocked: false,
    behaviourStatus: 'Good',
    blockReason: null,
    progress: [],
  },
];

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Dr. Evelyn Reed',
    expertise: ['Data Structures', 'Algorithms', 'Competitive Programming', 'FAANG Interviews'],
    bio: 'Principal Engineer at a top tech company with 15+ years of experience. Passionate about helping students excel in core computer science concepts and land their dream jobs.',
    imageUrl: 'https://i.pravatar.cc/300?u=mentor-1',
  },
  {
    id: 'mentor-2',
    name: 'Samuel Jones',
    expertise: ['Machine Learning', 'Data Science', 'Python', 'Project Building'],
    bio: 'Data Scientist with a focus on practical AI applications. I enjoy guiding students through building their first end-to-end machine learning projects.',
    imageUrl: 'https://i.pravatar.cc/300?u=mentor-2',
  },
  {
    id: 'mentor-3',
    name: 'Priya Sharma',
    expertise: ['Civil Engineering', 'GIS', 'Sustainable Infrastructure', 'Career Coaching'],
    bio: 'Lead Civil Engineer on major infrastructure projects. I specialize in modern surveying techniques and can provide insights into a career in civil engineering.',
    imageUrl: 'https://i.pravatar.cc/300?u=mentor-3',
  }
];

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Data Structures - Mid-Term',
    subject: 'Data Structures',
    durationMinutes: 30,
    createdBy: 'user-1',
    questions: [
      {
        id: 'q1',
        text: 'What is the time complexity of searching for an element in a balanced binary search tree?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
        correctAnswer: 'O(log n)',
      },
      {
        id: 'q2',
        text: 'Which data structure uses the Last-In, First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Tree'],
        correctAnswer: 'Stack',
      },
      {
        id: 'q3',
        text: 'What is the purpose of a hash function in a hash table?',
        options: ['To sort the elements', 'To find the median element', 'To map keys to indices', 'To reverse the elements'],
        correctAnswer: 'To map keys to indices',
      },
    ],
  },
  {
    id: 'exam-2',
    title: 'Algorithms - Quiz 1',
    subject: 'Algorithms',
    durationMinutes: 15,
    createdBy: 'user-1',
    questions: [
      {
        id: 'q1',
        text: 'Which sorting algorithm has the best average-case time complexity?',
        options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
        correctAnswer: 'Merge Sort',
      },
      {
        id: 'q2',
        text: 'Dijkstra\'s algorithm is used to solve which problem?',
        options: ['Maximum flow', 'Minimum spanning tree', 'All-pairs shortest path', 'Single-source shortest path'],
        correctAnswer: 'Single-source shortest path',
      },
    ],
  },
];