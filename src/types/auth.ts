export type UserRole = 'user' | 'counselor';

export interface LocalUser {
  id: string;
  email: string;
  name?: string;
  passwordHash: string; // Simple hash for demo
  pin?: string;
  role: UserRole; // 'user' or 'counselor'
  createdAt: Date;
  onboardingCompleted?: boolean;
  counselorProfile?: CounselorProfile;
  // Counselor specific fields
  counselorName?: string;
  specialization?: string[];
  bio?: string;
  availability?: {
    dayOfWeek: number; // 0-6
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }[];
  isVerified?: boolean; // Counselor verification status
}

export interface CounselorProfile {
  displayName: string;
  counselorName?: string;
  specialty?: string;
  specialization?: string[];
  bio?: string;
  availability?: LocalUser['availability'];
  isVerified?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isPinVerified: boolean;
  currentUserId: string | null;
  userRole: UserRole | null;
}
