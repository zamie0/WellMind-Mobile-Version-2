import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalUser, AuthState } from '@/types/auth';

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
  register: (email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  quickRegister: () => void;
  quickLogin: () => void;
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
      },

      register: (email, password) => {
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
          createdAt: new Date(),
        };
        
        set((state) => ({
          users: [...state.users, newUser],
          currentSession: {
            isAuthenticated: true,
            isPinVerified: true, // First time login, no PIN yet
            currentUserId: newUser.id,
          },
        }));
        
        return { success: true };
      },

      login: (email, password) => {
        const { users } = get();
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email === normalizedEmail);
        
        if (!user) {
          return { success: false, error: 'Email not found' };
        }
        
        if (user.passwordHash !== simpleHash(password)) {
          return { success: false, error: 'Incorrect password' };
        }
        
        set({
          currentSession: {
            isAuthenticated: true,
            isPinVerified: !user.pin, // If no PIN set, mark as verified
            currentUserId: user.id,
          },
        });
        
        return { success: true };
      },

      quickRegister: () => {
        const newUser: LocalUser = {
          id: crypto.randomUUID(),
          email: `user_${Date.now()}@wellmind.local`,
          passwordHash: '',
          createdAt: new Date(),
        };
        
        set((state) => ({
          users: [...state.users, newUser],
          currentSession: {
            isAuthenticated: true,
            isPinVerified: true,
            currentUserId: newUser.id,
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
    }),
    {
      name: 'wellmind-auth',
    }
  )
);
