import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';
import type { CounselorUser, CounselorChat, CounselorMessage } from '@/types/wellmind';
import { getAzureChatCompletion } from '@/lib/azureOpenAI';
import { apiRequest } from '@/lib/apiClient';

export type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
export type ConsultationType = 'chat' | 'video';

export interface ReminderPreferences {
  push: boolean;
  email: boolean;
  local: boolean;
}

export interface CounsellorAppointment {
  id: string;
  counselorId: string;
  appointmentDate: string;
  slot: string;
  consultationType: ConsultationType;
  reminders: ReminderPreferences;
  status: AppointmentStatus;
  notes?: string;
  persistence: 'local-mock';
  createdAt: string;
}

interface CounselorChatState {
  counselorProfile: CounselorUser | null;
  availableCounselors: CounselorUser[];
  chats: CounselorChat[];
  sessionStatuses: Record<string, 'requested' | 'confirmed' | 'completed'>;
  appointments: CounsellorAppointment[];
  counselorClients: Array<{ userId: string; userName: string; joinedDate: Date }>;

  createCounselorProfile: (displayName: string, isAnonymous: boolean, bio?: string, supportTopics?: string[]) => void;
  updateCounselorProfile: (updates: Partial<CounselorUser>) => void;
  loadAvailableCounselors: () => void;

  startChat: (counselorId: string) => string;
  sendMessage: (chatId: string, content: string) => void;
  deleteChat: (chatId: string) => void;
  getChat: (chatId: string) => CounselorChat | undefined;
  getChatWithCounselor: (counselorId: string) => CounselorChat | undefined;

  requestCounsellorSession: (counselorId: string) => void;
  setSessionStatus: (counselorId: string, status: 'requested' | 'confirmed' | 'completed') => void;

  getAvailableSlots: (counselorId: string, date: string) => string[];
  bookSession: (
    counselorId: string,
    date: string,
    slot: string,
    consultationType: ConsultationType,
    reminders: ReminderPreferences,
    notes?: string,
  ) => string | null;
  getAppointmentsForCounselor: (counselorId: string) => CounsellorAppointment[];
  getLatestAppointmentForCounselor: (counselorId: string) => CounsellorAppointment | undefined;

  // Counselor-specific methods
  registerClientWithCounselor: (userId: string, userName: string) => void;
  getCounselorClients: () => Array<{ userId: string; userName: string; joinedDate: Date }>;
  confirmAppointment: (appointmentId: string) => void;
  cancelAppointment: (appointmentId: string) => void;
  completeAppointment: (appointmentId: string) => void;
  missAppointment: (appointmentId: string) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newSlot: string, newConsultationType?: ConsultationType) => void;

  // AI assistant fallback while no real supporter is online
  simulateCounselorResponse: (chatId: string) => Promise<void>;
}

const DEFAULT_SLOTS = ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '07:00 PM'];

const COUNSELOR_RESPONSE_FALLBACKS = [
  "I hear you. That sounds really tough. How long have you been feeling this way?",
  "Thank you for sharing that with me. It takes courage to open up.",
  "I've been through something similar. You're not alone in this.",
  "That's completely valid. Your feelings matter.",
  "It sounds like you're carrying a lot right now. What helps you cope usually?",
  "I'm here for you. Take your time, no rush.",
  "Sometimes just talking about it can help. I'm listening.",
  "What would make today a little bit better for you?",
  "Remember, it's okay to not be okay sometimes.",
  "You're doing great by reaching out. That's a big step.",
];

const getCounselorSupportSystemPrompt = (counselorName: string): string => {
  return `You are ${counselorName}, a compassionate counselor in a private support chat. Keep replies conversational, empathetic, and practical in 2-4 short sentences. Do not use bullet points or structured lists.`;
};

const messageContentToText = (content: CounselorMessage['content']): string =>
  typeof content === 'string' ? content : '[encrypted message]';

export const useCounselorChatStore = create<CounselorChatState>()(
  persist(
    (set, get) => ({
      counselorProfile: null,
      availableCounselors: [],
      chats: [],
      sessionStatuses: {},
      appointments: [],
      counselorClients: [],

      createCounselorProfile: (displayName, isAnonymous, bio, supportTopics) => {
        const profile: CounselorUser = {
          id: `user-${crypto.randomUUID()}`,
          displayName: isAnonymous ? 'Anonymous' : displayName,
          isAnonymous,
          status: 'online',
          bio,
          supportTopics: supportTopics || [],
          joinedAt: new Date(),
        };
        set({ counselorProfile: profile });
      },

      updateCounselorProfile: (updates) => {
        set((state) => ({
          counselorProfile: state.counselorProfile ? { ...state.counselorProfile, ...updates } : null,
        }));
      },

      loadAvailableCounselors: async () => {
        try {
          const response = await apiRequest<{ counselors: Array<{
            id: string;
            displayName: string;
            bio: string;
            specialization: string[];
            rating: number;
            status: string;
            createdAt: string;
          }> }>('/api/counselor');

          set({
            availableCounselors: response.counselors.map((counselor) => ({
              id: counselor.id,
              displayName: counselor.displayName,
              isAnonymous: false,
              status: counselor.status === 'approved' ? 'online' : 'away',
              bio: counselor.bio,
              supportTopics: counselor.specialization || [],
              specialization: counselor.specialization?.join(', ') || 'Counseling',
              rating: counselor.rating,
              experienceYears: 0,
              consultationMethods: ['chat', 'video'],
              joinedAt: new Date(counselor.createdAt),
            })),
          });
        } catch (error) {
          console.error('Failed to load counselors from API:', error);
          set({ availableCounselors: [] });
        }
      },

      startChat: (counselorId) => {
        const existingChat = get().getChatWithCounselor(counselorId);
        if (existingChat) return existingChat.id;

        const counselor = get().availableCounselors.find((p) => p.id === counselorId);
        const profile = get().counselorProfile;

        if (!counselor || !profile) return '';

        const chat: CounselorChat = {
          id: `chat-${crypto.randomUUID()}`,
          participants: [profile.id, counselorId],
          participantNames: [profile.displayName, counselor.displayName],
          messages: [],
          createdAt: new Date(),
          lastMessageAt: new Date(),
        };

        set((state) => ({
          chats: [...state.chats, chat],
        }));

        return chat.id;
      },

      sendMessage: (chatId, content) => {
        const profile = get().counselorProfile;
        if (!profile) return;

        const message: CounselorMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId,
          senderId: profile.id,
          senderName: profile.displayName,
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  lastMessageAt: new Date(),
                }
              : chat
          ),
        }));

        setTimeout(() => {
          void get().simulateCounselorResponse(chatId);
        }, 1200 + Math.random() * 1800);
      },

      getChat: (chatId) => get().chats.find((c) => c.id === chatId),

      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
        }));
      },

      getChatWithCounselor: (counselorId) => get().chats.find((c) => c.participants.includes(counselorId)),

      requestCounsellorSession: (counselorId) => {
        set((state) => ({
          sessionStatuses: {
            ...state.sessionStatuses,
            [counselorId]: state.sessionStatuses[counselorId] ?? 'requested',
          },
        }));
      },

      setSessionStatus: (counselorId, status) => {
        set((state) => ({
          sessionStatuses: {
            ...state.sessionStatuses,
            [counselorId]: status,
          },
          appointments: state.appointments.map((appointment) =>
            appointment.counselorId === counselorId && appointment.status !== 'completed' && appointment.status !== 'cancelled'
              ? { ...appointment, status }
              : appointment
          ),
        }));
      },

      getAvailableSlots: (counselorId, date) => {
        const booked = new Set(
          get()
            .appointments
            .filter((appointment) => appointment.counselorId === counselorId && appointment.appointmentDate === date && appointment.status !== 'cancelled')
            .map((appointment) => appointment.slot)
        );
        return DEFAULT_SLOTS.filter((slot) => !booked.has(slot));
      },

      bookSession: (counselorId, date, slot, consultationType, reminders, notes) => {
        const available = get().getAvailableSlots(counselorId, date);
        if (!available.includes(slot)) {
          return null;
        }

        const appointment: CounsellorAppointment = {
          id: `appt-${crypto.randomUUID()}`,
          counselorId,
          appointmentDate: date,
          slot,
          consultationType,
          reminders,
          notes,
          status: 'requested',
          persistence: 'local-mock',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          appointments: [
            appointment,
            ...state.appointments.map((a) =>
              a.counselorId === counselorId && (a.status === 'requested' || a.status === 'confirmed')
                ? { ...a, status: 'cancelled' as AppointmentStatus }
                : a
            ),
          ],
          sessionStatuses: {
            ...state.sessionStatuses,
            [counselorId]: 'requested',
          },
        }));

        // Simulate counselor registering the client
        const counselorProfile = get().counselorProfile;
        if (counselorProfile) {
          get().registerClientWithCounselor(counselorProfile.id, counselorProfile.displayName);
        }

        return appointment.id;
      },

      getAppointmentsForCounselor: (counselorId) => get().appointments.filter((appointment) => appointment.counselorId === counselorId),

      getLatestAppointmentForCounselor: (counselorId) =>
        get().appointments.find((appointment) => appointment.counselorId === counselorId),

      registerClientWithCounselor: (userId, userName) => {
        set((state) => {
          const existing = state.counselorClients.find((c) => c.userId === userId);
          if (existing) return state;

          return {
            counselorClients: [
              ...state.counselorClients,
              { userId, userName, joinedDate: new Date() },
            ],
          };
        });
      },

      getCounselorClients: () => get().counselorClients,

      confirmAppointment: (appointmentId) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: 'confirmed' }
              : appointment
          ),
        }));
      },

      cancelAppointment: (appointmentId) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: 'cancelled' }
              : appointment
          ),
        }));
      },

      completeAppointment: (appointmentId) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: 'completed' }
              : appointment
          ),
        }));
      },

      missAppointment: (appointmentId) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: 'missed' }
              : appointment
          ),
        }));
      },

      rescheduleAppointment: (appointmentId, newDate, newSlot, newConsultationType) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? {
                  ...appointment,
                  appointmentDate: newDate,
                  slot: newSlot,
                  ...(newConsultationType ? { consultationType: newConsultationType } : {}),
                  status: 'requested',
                }
              : appointment
          ),
        }));
      },

      simulateCounselorResponse: async (chatId) => {
        const chat = get().getChat(chatId);
        const profile = get().counselorProfile;
        if (!chat || !profile) return;

        const counselorId = chat.participants.find((p) => p !== profile.id);
        const counselor = get().availableCounselors.find((p) => p.id === counselorId);
        if (!counselor) return;

        const conversation = chat.messages.slice(-8).map((message) => ({
          role: message.senderId === counselor.id ? 'assistant' as const : 'user' as const,
          content: messageContentToText(message.content),
        }));

        let content = COUNSELOR_RESPONSE_FALLBACKS[Math.floor(Math.random() * COUNSELOR_RESPONSE_FALLBACKS.length)];

        try {
          const reply = await getAzureChatCompletion(
            [
              {
                role: 'system',
                content: getCounselorSupportSystemPrompt(counselor.displayName),
              },
              ...conversation,
            ],
            { temperature: 0.85, maxTokens: 180 }
          );

          if (reply) {
            content = reply;
          }
        } catch {
          content = COUNSELOR_RESPONSE_FALLBACKS[Math.floor(Math.random() * COUNSELOR_RESPONSE_FALLBACKS.length)];
        }

        const response: CounselorMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId,
          senderId: counselor.id,
          senderName: `${counselor.displayName} (AI)`,
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, response],
                  lastMessageAt: new Date(),
                }
              : c
          ),
        }));
      },
    }),
    {
      name: 'wellmind-counselor-chat',
      version: 2,
    }
  )
);