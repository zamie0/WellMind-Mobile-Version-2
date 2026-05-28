export interface LocalUser {
  id: string;
  email: string;
  passwordHash: string; // Simple hash for demo
  pin?: string;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  isPinVerified: boolean;
  currentUserId: string | null;
}
