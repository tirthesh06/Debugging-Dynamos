export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Parent = 'parent',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  mobile?: string;
  registeredPhotoUrl: string;
  childId?: string; // For parents
  enableScanOnLogin?: boolean;
}

export interface AttendanceRecord {
  date: string; // e.g., '2023-10-27'
  subject: string;
  teacherName: string;
  timestamp: string; // e.g., '09:05 AM'
  status: 'Present' | 'Absent' | 'Late';
}

export interface DailyPlanItem {
    day: string;
    focus_topic: string;
    learning_activity: string;
    practice_task: string;
    estimated_time: string;
}

export interface LearningPath {
    overall_summary: string;
    daily_plan: DailyPlanItem[];
}

// New types for Progress Tracking
export enum AssignmentStatus {
  Graded = 'Graded',
  Submitted = 'Submitted',
  Pending = 'Pending',
  Late = 'Late',
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submittedDate?: string;
  status: AssignmentStatus;
  score?: number;
  maxScore: number;
}

export interface SubjectProgress {
  subjectName: string;
  overallGrade: string;
  teacherFeedback: string;
  assignments: Assignment[];
}

export enum EngagementStatus {
  Engaged = 'Engaged',
  Neutral = 'Neutral',
  Disengaged = 'Disengaged',
  Unknown = 'Unknown',
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  attendance: AttendanceRecord[];
  learningPath: LearningPath | null;
  isAccessBlocked: boolean;
  behaviourStatus: 'Good' | 'Needs Improvement';
  blockReason: 'Low Attendance' | 'Behaviour Issue' | 'Attendance & Behaviour' | null;
  progress: SubjectProgress[]; // Added progress tracking
  temporaryAccessExpires?: number; // Timestamp for manual override
  engagementStatus?: EngagementStatus; // For live class monitoring
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface PerformancePrediction {
  predicted_performance: string;
  confidence_score: string;
  rationale: string;
}

export interface ProgressInsight {
    strengths: string[];
    areas_for_improvement: string[];
    actionable_advice: string;
}

export interface ActivitySuggestion {
  title: string;
  description: string;
  category: 'Online Course' | 'Workshop' | 'Competition' | 'Project Idea' | 'Reading';
  rationale: string;
}


export interface FileNode {
    id: string;
    name: string;
    type: 'file';
    parentId: string | null;
    dataUrl: string;
    fileType: string;
}
export interface FolderNode {
    id:string;
    name: string;
    type: 'folder';
    parentId: string | null;
}
export type FileSystemNode = FileNode | FolderNode;

export interface SharedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdBy: string; // teacher's user id
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  reason: string;
  documentUrl?: string; // Data URL for the uploaded file
  status: 'Pending' | 'Approved' | 'Rejected';
  teacherComment?: string;
  applicationDate: string; // ISO string of submission date
}

// --- New Exam Types ---
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Exam {
  id:string;
  title: string;
  subject: string;
  durationMinutes: number;
  createdBy: string; // teacher's user id
  questions: Question[];
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  answers: { [questionId: string]: string }; // questionId: selectedAnswer
  submittedAt: number; // timestamp
  score: number; // percentage
  status: 'Completed' | 'Blocked';
}

// --- Smart Recommendation Types ---
export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  bio: string;
  imageUrl: string;
}

export interface ResourceRecommendation {
  title: string;
  type: 'Video' | 'Article' | 'Book' | 'Course';
  url: string;
  description: string;
}

export interface CareerSuggestion {
  path: string;
  skills_to_develop: string[];
  reasoning: string;
}

export interface MentorMatch {
  mentorId: string;
  reasoning: string;
}

export interface SmartRecommendations {
    resources: ResourceRecommendation[];
    career: CareerSuggestion;
    mentorMatch: MentorMatch;
}

// --- Engagement Detection Types ---
export interface EngagementAlert {
  studentId: string;
  studentName: string;
  message: string;
  timestamp: number;
}

export interface EngagementActivitySuggestion {
  title: string;
  description: string;
  type: 'Poll' | 'Question' | 'Break' | 'Discussion';
}

// --- Parent & Teacher Insights ---
export interface LearningStrategy {
  strategy_name: string;
  description: string;
  reasoning: string;
}

export interface ParentSummary {
  overall_summary: string;
  key_strengths: string[];
  areas_to_watch: string[];
}
