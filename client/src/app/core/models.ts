export type Role = 'applicant' | 'admin' | 'director';
export interface User { id: string; fullName: string; email: string; role: Role; }
export interface Course { _id: string; courseName: string; department: string; seats: number; }
export interface Doc { _id: string; originalName: string; size: number; uploadDate: string; docType: string; }
export interface History { from: string; to: string; changedAt: string; remarks?: string; changedBy?: { fullName: string } | string; }
export interface Application {
  _id: string; applicationNo?: string; fullName?: string; dob?: string; phone?: string; address?: string;
  courseId?: Course | string | null; percent10?: number; percent12?: number; iemjeeRank?: number;
  status: string; submissionDate?: string; locked: boolean; remarks?: string;
  documents: Doc[]; statusHistory: History[]; allowedNext?: string[];
}
export const STAGES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Accepted'
];

export const STATUSES = [
  'Submitted',
  'Under Review',
  'Accepted',
  'Rejected'
];
export const badgeClass = (s: string) => 'badge s-' + s.split(' ')[0];
export const courseName = (c: Application['courseId']) => (c && typeof c === 'object' ? c.courseName : '—');
