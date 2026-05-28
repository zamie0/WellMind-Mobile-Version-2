import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalUser, AuthState, UserRole } from '@/types/auth';

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

// Pre-made counselor accounts for testing
const createInitialCounselors = (): LocalUser[] => {
  const counselors: LocalUser[] = [];
  const counselorData = [
    { email: 'counselors01@wellmind.local', name: 'Dr. Sarah Miller', specs: ['Anxiety', 'Depression'], bio: 'Specialized in anxiety and depression management' },
    { email: 'counselors02@wellmind.local', name: 'Dr. James Chen', specs: ['Stress Management', 'Work Life Balance'], bio: 'Expert in stress reduction and workplace wellness' },
    { email: 'counselors03@wellmind.local', name: 'Dr. Emma Wilson', specs: ['Relationships', 'Family Therapy'], bio: 'Focused on relationship and family counseling' },
    { email: 'counselors04@wellmind.local', name: 'Dr. Michael Rodriguez', specs: ['Trauma', 'PTSD'], bio: 'Specializing in trauma recovery and PTSD treatment' },
    { email: 'counselors05@wellmind.local', name: 'Dr. Lisa Anderson', specs: ['Self Esteem', 'Personal Growth'], bio: 'Dedicated to personal development and self-discovery' },
  ];
  
  counselorData.forEach((data, index) => {
    counselors.push({
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash: simpleHash(`Counselors${String(index + 1).padStart(2, '0')}`),
      role: 'counselor',
      counselorName: data.name,
      specialization: data.specs,
      bio: data.bio,
      isVerified: true,
      createdAt: new Date(),
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      ],
    });
  });
  
  return counselors;
};

interface AuthStore {
  users: LocalUser[];
  currentSession: AuthState;
  
  // Actions
  register: (
    email: string,
    password: string,
    role?: UserRole,
    counselorData?: { displayName?: string; specialty?: string }
  ) => { success: boolean; error?: string };
  registerCounselor: (email: string, password: string, counselorName: string, specialization: string[], bio: string) => { success: boolean; error?: string };
  login: (email: string, password: string, expectedRole?: UserRole) => { success: boolean; error?: string };
  quickRegister: () => void;
  quickLogin: () => void;
  logout: () => void;
  setupPin: (pin: string) => boolean;
  verifyPin: (pin: string) => boolean;
  hasPin: () => boolean;
  getCurrentUser: () => LocalUser | null;
  resetPinVerification: () => void;
  updateCounselorProfile: (updates: Partial<LocalUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: createInitialCounselors(),
      currentSession: {
        isAuthenticated: false,
        isPinVerified: false,
        currentUserId: null,
        userRole: null,
      },

      register: (email, password, role = 'user', counselorData?: { displayName?: string; specialty?: string }) => {
        const { users } = get();
        const normalizedEmail = email.toLowerCase().trim();

        if (users.find(u => u.email === normalizedEmail)) {
          return { success: false, error: 'Email already registered' };
        }

        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        if (role === 'counselor' && !counselorData?.displayName) {
          return { success: false, error: 'Counselor name is required' };
        }

        const newUser: LocalUser = {
          id: crypto.randomUUID(),
          email: normalizedEmail,
          passwordHash: simpleHash(password),
          role: role,
          createdAt: new Date(),
          ...(role === 'counselor' && {
            counselorName: counselorData?.displayName,
            specialization: counselorData?.specialty ? [counselorData.specialty] : [],
            bio: '',
            availability: [],
            isVerified: true,
          }),
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

        return { success: true };
      },

      registerCounselor: (email, password, counselorName, specialization, bio) => {
        const { users } = get();
        const normalizedEmail = email.toLowerCase().trim();
        
        if (users.find(u => u.email === normalizedEmail)) {
          return { success: false, error: 'Email already registered' };
        }
        
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }
        
        if (!counselorName.trim()) {
          return { success: false, error: 'Counselor name is required' };
        }
        
        const newCounselor: LocalUser = {
          id: crypto.randomUUID(),
          email: normalizedEmail,
          passwordHash: simpleHash(password),
          role: 'counselor',
          counselorName: counselorName,
          specialization: specialization,
          bio: bio,
          isVerified: false, // Requires admin verification in production
          createdAt: new Date(),
          availability: [],
        };
        
        set((state) => ({
          users: [...state.users, newCounselor],
          currentSession: {
            isAuthenticated: true,
            isPinVerified: true,
            currentUserId: newCounselor.id,
            userRole: 'counselor',
          },
        }));

        return { success: true };
      },

      login: (email, password, expectedRole?: UserRole) => {
        const { users } = get();
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email === normalizedEmail);
        
        if (!user) {
          return { success: false, error: 'Email not found' };
        }
        
        if (user.passwordHash !== simpleHash(password)) {
          return { success: false, error: 'Incorrect password' };
        }

        if (expectedRole && user.role !== expectedRole) {
          return { success: false, error: `This account is registered as a ${user.role}` };
        }
        
        set({
          currentSession: {
            isAuthenticated: true,
            isPinVerified: !user.pin,
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
            userRole: 'user',
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
        const user = users.find(u => u.id === currentSession.currentUserId);
        
        if (user && user.role === 'counselor') {
          set({
            users: users.map(u =>
              u.id === currentSession.currentUserId
                ? { ...u, ...updates }
                : u
            ),
          });
        }
      },
    }),
    {
      name: 'wellmind-auth',
      version: 1,
    }
  )
);
