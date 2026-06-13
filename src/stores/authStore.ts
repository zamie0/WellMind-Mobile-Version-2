import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalUser, AuthState, UserRole, CounselorProfile } from '@/types/auth';
import { apiRequest } from '@/lib/apiClient';

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

const existingNameForEmail = (users: LocalUser[], email: string) =>
  users.find((user) => user.email === email)?.name;

interface AuthStore {
  users: LocalUser[];
  currentSession: AuthState;
  register: (email: string, password: string, role?: UserRole, counselorProfile?: CounselorProfile) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  quickRegister: () => void;
  quickLogin: () => void;
  updateCounselorProfile: (updates: Partial<CounselorProfile>) => void;
  updateCurrentUserProfile: (updates: { name?: string; avatar?: string; onboardingCompleted?: boolean; notificationsEnabled?: boolean }) => void;
  saveCurrentUserProfile: (updates: { name?: string; avatar?: string | null; onboardingCompleted?: boolean; notificationsEnabled?: boolean }) => Promise<{ success: boolean; user?: LocalUser; error?: string }>;
  logout: () => void;
  setupPin: (pin: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  hasPin: () => boolean;
  getCurrentUser: () => LocalUser | null;
  resetPinVerification: () => void;
}

type UserAuthResponse = {
  user: {
    id: string;
    email: string;
    role: 'user';
    name?: string;
    avatar?: string;
    onboardingCompleted?: boolean;
    notificationsEnabled?: boolean;
    hasPin?: boolean;
    createdAt: string;
  };
};

type CounselorAuthResponse = {
  counselor: {
    id: string;
    email: string;
    role: 'counselor';
    counselorName?: string;
    displayName?: string;
    specialization?: string[];
    bio?: string;
    availability?: LocalUser['availability'];
    isVerified?: boolean;
    hasPin?: boolean;
    createdAt: string;
  };
};

type PinUpdateResponse = {
  user?: UserAuthResponse['user'];
  counselor?: CounselorAuthResponse['counselor'];
};

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

      register: async (email, password, role = 'user') => {
        if (role === 'counselor') {
          return { success: false, error: 'Counselor accounts must be created in the WellMind Portal' };
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        try {
          const response = await apiRequest<UserAuthResponse>('/api/user/register', {
            method: 'POST',
            body: JSON.stringify({ email: normalizedEmail, password }),
          });

            const newUser: LocalUser = {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name || existingNameForEmail(get().users, response.user.email),
              avatar: response.user.avatar,
              onboardingCompleted: response.user.onboardingCompleted,
              notificationsEnabled: response.user.notificationsEnabled,
              hasPin: response.user.hasPin,
              passwordHash: '',
              role: 'user',
              createdAt: new Date(response.user.createdAt),
          };

          set((state) => ({
            users: [...state.users.filter((u) => u.email !== newUser.email), newUser],
            currentSession: {
              isAuthenticated: true,
              isPinVerified: true,
              currentUserId: newUser.id,
              userRole: 'user',
            },
          }));

          return { success: true };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
        }
      },

      login: async (email, password, role = 'user') => {
        const normalizedEmail = email.toLowerCase().trim();

        try {
          if (role === 'counselor') {
            const response = await apiRequest<CounselorAuthResponse>('/api/counselor/login', {
              method: 'POST',
              body: JSON.stringify({ email: normalizedEmail, password }),
            });

            const counselor = response.counselor;
            const existing = get().users.find((u) => u.id === counselor.id || u.email === counselor.email);
            const localUser: LocalUser = {
              id: counselor.id,
              email: counselor.email,
              passwordHash: '',
              role: 'counselor',
              createdAt: new Date(counselor.createdAt),
              counselorName: counselor.counselorName || counselor.displayName,
              specialization: counselor.specialization,
              bio: counselor.bio,
              availability: counselor.availability,
              isVerified: counselor.isVerified,
              hasPin: counselor.hasPin,
            };

            set((state) => ({
              users: [
                ...state.users.filter((u) => u.id !== localUser.id && u.email !== localUser.email),
                { ...existing, ...localUser },
              ],
              currentSession: {
                isAuthenticated: true,
                isPinVerified: !Boolean(counselor.hasPin ?? existing?.hasPin ?? existing?.pin),
                currentUserId: localUser.id,
                userRole: 'counselor',
              },
            }));

            return { success: true };
          }

          const response = await apiRequest<UserAuthResponse>('/api/user/login', {
            method: 'POST',
            body: JSON.stringify({ email: normalizedEmail, password }),
          });

          const user = response.user;
          const existing = get().users.find((u) => u.id === user.id || u.email === user.email);
          const localUser: LocalUser = {
            id: user.id,
            email: user.email,
            name: user.name || existing?.name,
            avatar: user.avatar || existing?.avatar,
            onboardingCompleted: user.onboardingCompleted ?? existing?.onboardingCompleted,
            notificationsEnabled: user.notificationsEnabled ?? existing?.notificationsEnabled,
            hasPin: user.hasPin ?? existing?.hasPin,
            passwordHash: '',
            role: 'user',
            createdAt: new Date(user.createdAt),
          };

          set((state) => ({
            users: [
              ...state.users.filter((u) => u.id !== localUser.id && u.email !== localUser.email),
              { ...existing, ...localUser },
            ],
            currentSession: {
              isAuthenticated: true,
              isPinVerified: !Boolean(user.hasPin ?? existing?.hasPin ?? existing?.pin),
              currentUserId: localUser.id,
              userRole: 'user',
            },
          }));

          return { success: true };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
        }
      },

      quickRegister: () => {
        const newUser: LocalUser = {
          id: crypto.randomUUID(),
          email: `user_${Date.now()}@wellmind.local`,
          name: 'WellMind User',
          onboardingCompleted: false,
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
              isPinVerified: !Boolean(lastUser.hasPin || lastUser.pin),
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

      setupPin: async (pin) => {
        const { currentSession, users } = get();
        if (!currentSession.currentUserId || !/^\d{6}$/.test(pin)) return false;

        const isCounselor = currentSession.userRole === 'counselor';
        const path = isCounselor
          ? `/api/counselor/${currentSession.currentUserId}/pin`
          : `/api/user/${currentSession.currentUserId}/pin`;

        try {
          await apiRequest<PinUpdateResponse>(path, {
            method: 'PATCH',
            body: JSON.stringify({ pin }),
          });

          set({
            users: users.map((u) =>
              u.id === currentSession.currentUserId
                ? { ...u, pin: simpleHash(pin), hasPin: true }
                : u,
            ),
            currentSession: {
              ...currentSession,
              isPinVerified: true,
            },
          });

          return true;
        } catch (error) {
          console.error('Failed to save PIN:', error);
          return false;
        }
      },

      verifyPin: async (pin) => {
        const { currentSession, users } = get();
        const user = users.find((u) => u.id === currentSession.currentUserId);
        if (!user || !currentSession.currentUserId || !/^\d{6}$/.test(pin)) return false;

        const isCounselor = currentSession.userRole === 'counselor';
        const path = isCounselor
          ? `/api/counselor/${currentSession.currentUserId}/pin/verify`
          : `/api/user/${currentSession.currentUserId}/pin/verify`;

        try {
          await apiRequest<{ ok: boolean }>(path, {
            method: 'POST',
            body: JSON.stringify({ pin }),
          });
          set({
            currentSession: {
              ...currentSession,
              isPinVerified: true,
            },
          });
          return true;
        } catch (error) {
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
        }
      },

      hasPin: () => {
        const { currentSession, users } = get();
        const user = users.find((u) => u.id === currentSession.currentUserId);
        return Boolean(user?.hasPin || user?.pin);
      },

      getCurrentUser: () => {
        const { currentSession, users } = get();
        return users.find((u) => u.id === currentSession.currentUserId) || null;
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
          users: users.map((u) =>
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
              : u,
          ),
        });
      },

      updateCurrentUserProfile: (updates) => {
        const { currentSession, users } = get();
        if (!currentSession.currentUserId) return;

        set({
          users: users.map((u) =>
            u.id === currentSession.currentUserId
              ? { ...u, ...updates }
              : u,
          ),
        });
      },

      saveCurrentUserProfile: async (updates) => {
        const { currentSession } = get();
        if (!currentSession.currentUserId || currentSession.userRole !== 'user') {
          return { success: false, error: 'No user account is active' };
        }

        try {
          const response = await apiRequest<UserAuthResponse>(`/api/user/${currentSession.currentUserId}/profile`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
          });

          const apiUser = response.user;
          const localUser: LocalUser = {
            id: apiUser.id,
            email: apiUser.email,
            name: apiUser.name,
            avatar: apiUser.avatar,
            onboardingCompleted: apiUser.onboardingCompleted,
            notificationsEnabled: apiUser.notificationsEnabled,
            hasPin: apiUser.hasPin,
            passwordHash: '',
            role: 'user',
            createdAt: new Date(apiUser.createdAt),
          };

          let savedUser: LocalUser = localUser;
          set((state) => {
            const existing = state.users.find((u) => u.id === localUser.id || u.email === localUser.email);
            savedUser = { ...existing, ...localUser };
            return {
              users: [
                ...state.users.filter((u) => u.id !== localUser.id && u.email !== localUser.email),
                savedUser,
              ],
            };
          });

          return { success: true, user: savedUser };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Profile update failed' };
        }
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
          isPinVerified: false,
        },
      }),
    },
  ),
);
