export type UserRole = 'KETUA' | 'ANGGOTA' | 'DOSEN';

export interface User {
  id: string;
  nim: string; // or NIP for lecturer
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  major?: string;
  classGroup?: string;
  passwordHash?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'REVISION' | 'DONE';

export type TaskPriority = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'MENDESAK';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'file' | 'drive' | 'github';
  submittedBy: string;
  submittedAt: string;
}

export interface TaskRevision {
  id: string;
  requestedBy: string; // name
  requestedByRole: UserRole;
  requestedAt: string;
  note: string;
  resolved: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  comment: string;
  createdAt: string;
  isLecturerNote?: boolean;
}

export interface Task {
  id: string;
  groupId: string;
  title: string;
  description: string;
  assignedTo: string[]; // User IDs (bisa multi PIC)
  assignedNames: string[]; // User names for quick display
  status: TaskStatus;
  priority: TaskPriority;
  weight: number; // Bobot tugas dalam persentase (e.g. 15%)
  dueDate: string; // ISO format or YYYY-MM-DD
  dueTime?: string; // HH:mm
  completedAt?: string;
  createdAt: string;
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  revisions: TaskRevision[];
  comments: TaskComment[];
  score?: number; // Score from Dosen (0-100)
  lecturerFeedback?: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  nim: string;
  role: UserRole; // Ketua atau Anggota
  email: string;
  specialization?: string; // e.g., UI/UX, Backend, QA
  joinedAt: string;
}

export interface GroupEvaluation {
  lecturerId: string;
  lecturerName: string;
  score: number; // 0-100
  notes: string;
  evaluationDate: string;
  rubric: {
    collaborativeEffort: number; // 1-5
    deadlinePunctuality: number; // 1-5
    qualityOfWork: number; // 1-5
    systemDocumentation: number; // 1-5
  };
}

export interface Group {
  id: string;
  code: string; // Group join code e.g. "RPL-K04"
  name: string; // e.g. "Kelompok 4 - Sistem Monitoring Tugas"
  courseName: string; // e.g. "Rekayasa Perangkat Lunak"
  classSection: string; // e.g. "IF-22-B"
  lecturerName: string;
  lecturerNip: string;
  description: string;
  createdAt: string;
  createdBy: string;
  members: GroupMember[];
  evaluation?: GroupEvaluation;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'status_change' | 'revision' | 'assignment' | 'evaluation' | 'location';
  createdAt: string;
  read: boolean;
  taskId?: string;
  groupId?: string;
  actionUrl?: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  description: string;
}

export interface ActivityLog {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  taskTitle?: string;
}
