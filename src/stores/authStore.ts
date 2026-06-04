import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalUser, AuthState, UserRole, CounselorProfile } from '@/types/auth';

// Simple hash function for demo purposes (not secure for production)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

interface AuthStore {
  users: LocalUser[];
  currentSession: AuthState;
  
  // Actions
  register: (email: string, password: string, role?: UserRole, counselorProfile?: CounselorProfile) => { success: boolean; error?: string };
  login: (email: string, password: string, role?: UserRole) => { success: boolean; error?: string };
  quickRegister: () => void;
  quickLogin: () => void;
  updateCounselorProfile: (updates: Partial<CounselorProfile>) => void;
  logout: () => void;
  setupPin: (pin: string) => boolean;
  verifyPin: (pin: string) => boolean;
  hasPin: () => boolean;
  getCurrentUser: () => LocalUser | null;
  resetPinVerification: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentSession: {
        isAuthenticated: false,
        isPinVerified: false,
        currentUserId: null,
        userRole: null,
      },

      register: (email, password, role = 'user', counselorProfile) => {
        const { users } = get();
        const normalizedEmail = email.toLowerCase().trim();
        
        if (users.find(u => u.email === normalizedEmail)) {
          return { success: false, error: 'Email already registered' };
        }
        
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }
        
        const newUser: LocalUser = {
          id: crypto.randomUUID(),
          email: normalizedEmail,
          passwordHash: simpleHash(password),
          role,
          counselorProfile: role === 'counselor' ? counselorProfile : undefined,
          counselorName: role === 'counselor' ? counselorProfile?.displayName : undefined,
          specialization: role === 'counselor' && counselorProfile?.specialty ? [counselorProfile.specialty] : counselorProfile?.specialization,
          bio: role === 'counselor' ? counselorProfile?.bio : undefined,
          availability: role === 'counselor' ? counselorProfile?.availability : undefined,
          isVerified: role === 'counselor' ? counselorProfile?.isVerified ?? false : undefined,
          createdAt: new Date(),
        };
        
        set((state) => ({
          users: [...state.users, newUser],
          currentSession: {
            isAuthenticated: true,
            isPinVerified: true, // First time login, no PIN yet
            currentUserId: newUser.id,
            userRole: role,
          },
        }));
        
        return { success: true };
      },

      login: (email, password, role) => {
        const { users } = get();
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email === normalizedEmail);
        
        if (!user) {
          return { success: false, error: 'Email not found' };
        }
        
        if (user.passwordHash !== simpleHash(password)) {
          return { success: false, error: 'Incorrect password' };
        }

        if (role && user.role !== role) {
          return {
            success: false,
            error: role === 'counselor'
              ? 'This account is not a Counselor account'
              : 'This account belongs to a Counselor — switch to the Counselor tab',
          };
        }
        
        set({
          currentSession: {
            isAuthenticated: true,
            isPinVerified: !user.pin, // If no PIN set, mark as verified
            currentUserId: user.id,
            userRole: user.role,
          },
        });
        
        return { success: true };
      },

      quickRegister: () => {
        const newUser: LocalUser = {
          id: crypto.randomUUID(),
          email: `user_${Date.now()}@wellmind.local`,
          passwordHash: '',
          role: 'user',
          createdAt: new Date(),
        };
        
        set((state) => ({
          users: [...state.users, newUser],
          currentSession: {
            isAuthenticated: true,
            isPinVerified: true,
            currentUserId: newUser.id,
            userRole: newUser.role,
          },
        }));
      },

      quickLogin: () => {
        const { users } = get();
        const lastUser = users[users.length - 1];
        
        if (lastUser) {
          set({
            currentSession: {
              isAuthenticated: true,
              isPinVerified: !lastUser.pin,
              currentUserId: lastUser.id,
              userRole: lastUser.role,
            },
          });
        } else {
          // No existing user, create one
          get().quickRegister();
        }
      },

      logout: () => {
        set({
          currentSession: {
            isAuthenticated: false,
            isPinVerified: false,
            currentUserId: null,
            userRole: null,
          },
        });
      },

      setupPin: (pin) => {
        const { currentSession, users } = get();
        if (!currentSession.currentUserId || pin.length !== 6) return false;
        
        set({
          users: users.map(u => 
            u.id === currentSession.currentUserId 
              ? { ...u, pin: simpleHash(pin) }
              : u
          ),
        });
        
        return true;
      },

      verifyPin: (pin) => {
        const { currentSession, users } = get();
        const user = users.find(u => u.id === currentSession.currentUserId);
        
        if (!user || !user.pin) return false;
        
        if (user.pin === simpleHash(pin)) {
          set({
            currentSession: {
              ...currentSession,
              isPinVerified: true,
            },
          });
          return true;
        }
        
        return false;
      },

      hasPin: () => {
        const { currentSession, users } = get();
        const user = users.find(u => u.id === currentSession.currentUserId);
        return !!user?.pin;
      },

      getCurrentUser: () => {
        const { currentSession, users } = get();
        return users.find(u => u.id === currentSession.currentUserId) || null;
      },

      resetPinVerification: () => {
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            isPinVerified: false,
          },
        }));
      },

      updateCounselorProfile: (updates) => {
        const { currentSession, users } = get();
        if (!currentSession.currentUserId) return;
        set({
          users: users.map(u =>
            u.id === currentSession.currentUserId && u.role === 'counselor'
              ? {
                  ...u,
                  counselorProfile: { ...(u.counselorProfile ?? { displayName: '' }), ...updates },
                  counselorName: updates.counselorName ?? updates.displayName ?? u.counselorName,
                  specialization: updates.specialization ?? u.specialization,
                  bio: updates.bio ?? u.bio,
                  availability: updates.availability ?? u.availability,
                  isVerified: updates.isVerified ?? u.isVerified,
                }
              : u
          ),
        });
      },
    }),
    {
      name: 'wellmind-auth',
      partialize: (state) => ({
        users: state.users,
        currentSession: {
          isAuthenticated: state.currentSession.isAuthenticated,
          currentUserId: state.currentSession.currentUserId,
          userRole: state.currentSession.userRole,
          isPinVerified: false, // always require re-verifying PIN on app open
        },
      }),
    }
  )
);
