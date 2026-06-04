import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';
import type { PeerUser, PeerChat, PeerMessage } from '@/types/wellmind';
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
  peerId: string;
  appointmentDate: string;
  slot: string;
  consultationType: ConsultationType;
  reminders: ReminderPreferences;
  status: AppointmentStatus;
  notes?: string;
  persistence: 'local-mock';
  createdAt: string;
}

interface PeerChatState {
  peerProfile: PeerUser | null;
  availablePeers: PeerUser[];
  chats: PeerChat[];
  sessionStatuses: Record<string, 'requested' | 'confirmed' | 'completed'>;
  appointments: CounsellorAppointment[];
  counselorClients: Array<{ userId: string; userName: string; joinedDate: Date }>;

  createPeerProfile: (displayName: string, isAnonymous: boolean, bio?: string, supportTopics?: string[]) => void;
  updatePeerProfile: (updates: Partial<PeerUser>) => void;
  loadAvailablePeers: () => void;

  startChat: (peerId: string) => string;
  sendMessage: (chatId: string, content: string) => void;
  deleteChat: (chatId: string) => void;
  getChat: (chatId: string) => PeerChat | undefined;
  getChatWithPeer: (peerId: string) => PeerChat | undefined;

  requestCounsellorSession: (peerId: string) => void;
  setSessionStatus: (peerId: string, status: 'requested' | 'confirmed' | 'completed') => void;

  getAvailableSlots: (peerId: string, date: string) => string[];
  bookSession: (
    peerId: string,
    date: string,
    slot: string,
    consultationType: ConsultationType,
    reminders: ReminderPreferences,
    notes?: string,
  ) => string | null;
  getAppointmentsForPeer: (peerId: string) => CounsellorAppointment[];
  getLatestAppointmentForPeer: (peerId: string) => CounsellorAppointment | undefined;

  // Counselor-specific methods
  registerClientWithCounselor: (userId: string, userName: string) => void;
  getCounselorClients: () => Array<{ userId: string; userName: string; joinedDate: Date }>;
  confirmAppointment: (appointmentId: string) => void;
  cancelAppointment: (appointmentId: string) => void;
  completeAppointment: (appointmentId: string) => void;
  missAppointment: (appointmentId: string) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newSlot: string, newConsultationType?: ConsultationType) => void;

  // AI assistant fallback while no real supporter is online
  simulatePeerResponse: (chatId: string) => Promise<void>;
}

const SIMULATED_PEERS: PeerUser[] = [
  {
    id: 'peer-1',
    displayName: 'Khoo Weng Yen',
    isAnonymous: false,
    status: 'online',
    supportTopics: ['Anxiety', 'Stress', 'Work-life balance'],
    specialization: 'Anxiety & Stress Specialist',
    rating: 4.9,
    experienceYears: 1,
    consultationMethods: ['chat', 'video'],
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: 'peer-2',
    displayName: 'Aina Yusuf',
    isAnonymous: false,
    status: 'online',
    supportTopics: ['Depression', 'Loneliness', 'Life transitions'],
    specialization: 'Student Mental Health Support',
    rating: 4.7,
    experienceYears: 5,
    consultationMethods: ['chat', 'video'],
    joinedAt: new Date('2024-02-20'),
  },
  {
    id: 'peer-3',
    displayName: 'Daniel Tan',
    isAnonymous: false,
    status: 'away',
    supportTopics: ['Academic stress', 'Relationships', 'Self-esteem'],
    specialization: 'Relationship & Emotional Wellness',
    rating: 4.8,
    experienceYears: 6,
    consultationMethods: ['chat', 'video'],
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: 'peer-4',
    displayName: 'Mei Lin',
    isAnonymous: false,
    status: 'online',
    supportTopics: ['General support', 'Mindfulness', 'Coping strategies'],
    specialization: 'Mindfulness & Wellness Coach',
    rating: 4.6,
    experienceYears: 4,
    consultationMethods: ['chat', 'video'],
    joinedAt: new Date('2024-04-05'),
  },
  {
    id: 'peer-5',
    displayName: 'Ravi Nair',
    isAnonymous: false,
    status: 'busy',
    supportTopics: ['Family issues', 'Grief', 'Personal growth'],
    specialization: 'Grief & Family Counsellor',
    rating: 4.8,
    experienceYears: 7,
    consultationMethods: ['chat', 'video'],
    joinedAt: new Date('2024-05-12'),
  },
];

const DEFAULT_SLOTS = ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '07:00 PM'];

const PEER_RESPONSE_FALLBACKS = [
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

const getPeerSupportSystemPrompt = (peerName: string): string => {
  return `You are ${peerName}, a compassionate peer supporter in a private support chat. Keep replies conversational, empathetic, and practical in 2-4 short sentences. Do not use bullet points or structured lists.`;
};

const messageContentToText = (content: PeerMessage['content']): string =>
  typeof content === 'string' ? content : '[encrypted message]';

export const usePeerChatStore = create<PeerChatState>()(
  persist(
    (set, get) => ({
      peerProfile: null,
      availablePeers: [],
      chats: [],
      sessionStatuses: {},
      appointments: [
        {
          id: 'sample-appt-1',
          peerId: 'peer-1',
          appointmentDate: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })(),
          slot: '10:00 AM',
          consultationType: 'chat',
          reminders: { push: true, email: false, local: true },
          status: 'requested',
          notes: 'Sample session – feel free to book a real one.',
          persistence: 'local-mock',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-appt-2',
          peerId: 'peer-2',
          appointmentDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })(),
          slot: '2:00 PM',
          consultationType: 'video',
          reminders: { push: true, email: false, local: true },
          status: 'confirmed',
          notes: 'Sample confirmed session.',
          persistence: 'local-mock',
          createdAt: new Date().toISOString(),
        },
      ],
      counselorClients: [],

      createPeerProfile: (displayName, isAnonymous, bio, supportTopics) => {
        const profile: PeerUser = {
          id: `user-${crypto.randomUUID()}`,
          displayName: isAnonymous ? 'Anonymous' : displayName,
          isAnonymous,
          status: 'online',
          bio,
          supportTopics: supportTopics || [],
          joinedAt: new Date(),
        };
        set({ peerProfile: profile });
      },

      updatePeerProfile: (updates) => {
        set((state) => ({
          peerProfile: state.peerProfile ? { ...state.peerProfile, ...updates } : null,
        }));
      },

      loadAvailablePeers: async () => {
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
            availablePeers: response.counselors.map((counselor) => ({
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
          set({ availablePeers: [] });
        }
      },

      startChat: (peerId) => {
        const existingChat = get().getChatWithPeer(peerId);
        if (existingChat) return existingChat.id;

        const peer = get().availablePeers.find((p) => p.id === peerId);
        const profile = get().peerProfile;

        if (!peer || !profile) return '';

        const chat: PeerChat = {
          id: `chat-${crypto.randomUUID()}`,
          participants: [profile.id, peerId],
          participantNames: [profile.displayName, peer.displayName],
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
        const profile = get().peerProfile;
        if (!profile) return;

        const message: PeerMessage = {
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
          void get().simulatePeerResponse(chatId);
        }, 1200 + Math.random() * 1800);
      },

      getChat: (chatId) => get().chats.find((c) => c.id === chatId),

      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
        }));
      },

      getChatWithPeer: (peerId) => get().chats.find((c) => c.participants.includes(peerId)),

      requestCounsellorSession: (peerId) => {
        set((state) => ({
          sessionStatuses: {
            ...state.sessionStatuses,
            [peerId]: state.sessionStatuses[peerId] ?? 'requested',
          },
        }));
      },

      setSessionStatus: (peerId, status) => {
        set((state) => ({
          sessionStatuses: {
            ...state.sessionStatuses,
            [peerId]: status,
          },
          appointments: state.appointments.map((appointment) =>
            appointment.peerId === peerId && appointment.status !== 'completed' && appointment.status !== 'cancelled'
              ? { ...appointment, status }
              : appointment
          ),
        }));
      },

      getAvailableSlots: (peerId, date) => {
        const booked = new Set(
          get()
            .appointments
            .filter((appointment) => appointment.peerId === peerId && appointment.appointmentDate === date && appointment.status !== 'cancelled')
            .map((appointment) => appointment.slot)
        );
        return DEFAULT_SLOTS.filter((slot) => !booked.has(slot));
      },

      bookSession: (peerId, date, slot, consultationType, reminders, notes) => {
        const available = get().getAvailableSlots(peerId, date);
        if (!available.includes(slot)) {
          return null;
        }

        const appointment: CounsellorAppointment = {
          id: `appt-${crypto.randomUUID()}`,
          peerId,
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
              a.peerId === peerId && (a.status === 'requested' || a.status === 'confirmed')
                ? { ...a, status: 'cancelled' as AppointmentStatus }
                : a
            ),
          ],
          sessionStatuses: {
            ...state.sessionStatuses,
            [peerId]: 'requested',
          },
        }));

        // Simulate counselor registering the client
        const peerProfile = get().peerProfile;
        if (peerProfile) {
          get().registerClientWithCounselor(peerProfile.id, peerProfile.displayName);
        }

        return appointment.id;
      },

      getAppointmentsForPeer: (peerId) => get().appointments.filter((appointment) => appointment.peerId === peerId),

      getLatestAppointmentForPeer: (peerId) =>
        get().appointments.find((appointment) => appointment.peerId === peerId),

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

      simulatePeerResponse: async (chatId) => {
        const chat = get().getChat(chatId);
        const profile = get().peerProfile;
        if (!chat || !profile) return;

        const peerId = chat.participants.find((p) => p !== profile.id);
        const peer = get().availablePeers.find((p) => p.id === peerId);
        if (!peer) return;

        const conversation = chat.messages.slice(-8).map((message) => ({
          role: message.senderId === peer.id ? 'assistant' as const : 'user' as const,
          content: messageContentToText(message.content),
        }));

        let content = PEER_RESPONSE_FALLBACKS[Math.floor(Math.random() * PEER_RESPONSE_FALLBACKS.length)];

        try {
          const reply = await getAzureChatCompletion(
            [
              {
                role: 'system',
                content: getPeerSupportSystemPrompt(peer.displayName),
              },
              ...conversation,
            ],
            { temperature: 0.85, maxTokens: 180 }
          );

          if (reply) {
            content = reply;
          }
        } catch {
          content = PEER_RESPONSE_FALLBACKS[Math.floor(Math.random() * PEER_RESPONSE_FALLBACKS.length)];
        }

        const response: PeerMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId,
          senderId: peer.id,
          senderName: `${peer.displayName} (AI)` ,
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
      name: 'wellmind-peer-chat',
      version: 2,
    }
  )
);
