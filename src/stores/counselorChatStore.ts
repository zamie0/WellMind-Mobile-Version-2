import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';
import type { ChatAttachment, CounselorUser, CounselorChat, CounselorMessage } from '@/types/wellmind';
import { apiRequest } from '@/lib/apiClient';
import {
  getChatSocket,
  getOrCreateConversation,
  identifyChatParticipant,
  joinConversationRoom,
  leaveConversationRoom,
  listConversations,
  listMessages,
  markConversationRead,
  sendChatMessage,
  type ChatConversation,
  type ChatMessage,
} from '@/lib/realtimeCounselorChat';
import {
  createAppointment,
  listAppointments,
  type RemoteAppointment,
} from '@/lib/appointmentsApi';

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
  persistence: 'local-mock' | 'remote';
  createdAt: string;
  clientId?: string;
  clientName?: string;
}

interface CounselorChatState {
  counselorProfile: CounselorUser | null;
  availableCounselors: CounselorUser[];
  chats: CounselorChat[];
  sessionStatuses: Record<string, 'requested' | 'confirmed' | 'completed'>;
  appointments: CounsellorAppointment[];
  counselorClients: Array<{ userId: string; userName: string; joinedDate: Date }>;

  createCounselorProfile: (displayName: string, isAnonymous: boolean, bio?: string, supportTopics?: string[], userId?: string) => void;
  updateCounselorProfile: (updates: Partial<CounselorUser>) => void;
  loadAvailableCounselors: () => Promise<void>;
  subscribeRealtime: () => () => void;
  loadUserConversations: () => Promise<void>;
  loadUserAppointments: () => Promise<void>;

  startChat: (counselorId: string) => Promise<string>;
  sendMessage: (chatId: string, content: string, attachment?: ChatAttachment) => Promise<void>;
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
  ) => Promise<string | null>;
  getAppointmentsForCounselor: (counselorId: string) => CounsellorAppointment[];
  getLatestAppointmentForCounselor: (counselorId: string) => CounsellorAppointment | undefined;

  registerClientWithCounselor: (userId: string, userName: string) => void;
  getCounselorClients: () => Array<{ userId: string; userName: string; joinedDate: Date }>;
  confirmAppointment: (appointmentId: string) => void;
  cancelAppointment: (appointmentId: string) => void;
  completeAppointment: (appointmentId: string) => void;
  missAppointment: (appointmentId: string) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newSlot: string, newConsultationType?: ConsultationType) => void;
}

const DEFAULT_SLOTS = ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '07:00 PM'];

const toChat = (conversation: ChatConversation, messages: ChatMessage[] = []): CounselorChat => ({
  id: conversation.id,
  participants: [conversation.userId, conversation.counselorId],
  participantNames: [conversation.userName, conversation.counselorName],
  messages: messages.map(toMessage),
  createdAt: new Date(conversation.createdAt),
  lastMessageAt: new Date(conversation.lastMessageAt || conversation.updatedAt),
  lastMessage: conversation.lastMessage,
  unreadForUser: conversation.unreadForUser,
  unreadForCounselor: conversation.unreadForCounselor,
});

const toMessage = (message: ChatMessage): CounselorMessage => ({
  id: message.id,
  chatId: message.conversationId,
  senderId: message.senderId,
  senderName: message.senderName,
  content: message.text,
  attachment: message.attachment,
  timestamp: new Date(message.createdAt),
  isRead: message.isRead,
  optimistic: message.optimistic,
  failed: message.failed,
});

const mergeChat = (chats: CounselorChat[], next: CounselorChat) => {
  const index = chats.findIndex((chat) => chat.id === next.id);
  if (index === -1) return [next, ...chats];
  const merged = [...chats];
  merged[index] = { ...merged[index], ...next, messages: next.messages.length ? next.messages : merged[index].messages };
  return merged.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
};

const toLocalAppointment = (appointment: RemoteAppointment): CounsellorAppointment => ({
  id: appointment.id,
  counselorId: appointment.counselorId,
  appointmentDate: appointment.appointmentDate,
  slot: appointment.slot,
  consultationType: appointment.consultationType,
  reminders: appointment.reminders,
  status: appointment.status,
  notes: appointment.notes,
  persistence: 'remote',
  createdAt: appointment.createdAt,
  clientId: appointment.clientId,
  clientName: appointment.clientName,
});

export const useCounselorChatStore = create<CounselorChatState>()(
  persist(
    (set, get) => ({
      counselorProfile: null,
      availableCounselors: [],
      chats: [],
      sessionStatuses: {},
      appointments: [],
      counselorClients: [],

      createCounselorProfile: (displayName, isAnonymous, bio, supportTopics, userId) => {
        const profile: CounselorUser = {
          id: userId || `user-${crypto.randomUUID()}`,
          displayName: isAnonymous ? 'Anonymous' : displayName,
          isAnonymous,
          status: 'online',
          bio,
          supportTopics: supportTopics || [],
          joinedAt: new Date(),
        };
        set({ counselorProfile: profile });
        identifyChatParticipant('user', profile.id);
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

      subscribeRealtime: () => {
        const profile = get().counselorProfile;
        if (profile) identifyChatParticipant('user', profile.id);

        const socket = getChatSocket();

        const onConversationUpdated = (conversation: ChatConversation) => {
          const current = get().counselorProfile;
          if (!current || conversation.userId !== current.id) return;
          set((state) => ({ chats: mergeChat(state.chats, toChat(conversation)) }));
        };

        const onMessageNew = (message: ChatMessage) => {
          const chat = get().getChat(message.conversationId);
          if (!chat) {
            void get().loadUserConversations();
            return;
          }
          set((state) => ({
            chats: state.chats.map((item) => {
              if (item.id !== message.conversationId) return item;
              const withoutOptimistic = item.messages.filter((m) => !(m.optimistic && m.content === message.text && m.senderId === message.senderId));
              if (withoutOptimistic.some((m) => m.id === message.id)) return item;
              return { ...item, messages: [...withoutOptimistic, toMessage(message)], lastMessageAt: new Date(message.createdAt) };
            }),
          }));
        };

        const onPresence = ({ onlineCounselorIds = [] }: { onlineCounselorIds?: string[] }) => {
          const online = new Set(onlineCounselorIds);
          set((state) => ({
            availableCounselors: state.availableCounselors.map((counselor) => ({
              ...counselor,
              status: online.has(counselor.id) ? 'online' : 'away',
            })),
          }));
        };

        socket.on('conversation:updated', onConversationUpdated);
        socket.on('message:new', onMessageNew);
        socket.on('counselor:presence', onPresence);

        get().chats.forEach((chat) => joinConversationRoom(chat.id));

        return () => {
          socket.off('conversation:updated', onConversationUpdated);
          socket.off('message:new', onMessageNew);
          socket.off('counselor:presence', onPresence);
        };
      },

      loadUserConversations: async () => {
        const profile = get().counselorProfile;
        if (!profile) return;
        identifyChatParticipant('user', profile.id);
        const { conversations } = await listConversations('user', profile.id);
        const hydrated = await Promise.all(
          conversations.map(async (conversation) => {
            const { messages } = await listMessages(conversation.id);
            joinConversationRoom(conversation.id);
            return toChat(conversation, messages);
          }),
        );
        set({ chats: hydrated });
      },

      loadUserAppointments: async () => {
        const profile = get().counselorProfile;
        if (!profile) return;
        const { appointments } = await listAppointments('user', profile.id);
        set({ appointments: appointments.map(toLocalAppointment) });
      },

      startChat: async (counselorId) => {
        const profile = get().counselorProfile;
        if (!profile) return '';

        const existingChat = get().getChatWithCounselor(counselorId);
        if (existingChat) {
          joinConversationRoom(existingChat.id);
          return existingChat.id;
        }

        const { conversation } = await getOrCreateConversation({
          userId: profile.id,
          counselorId,
          userName: profile.displayName,
        });
        const chat = toChat(conversation);
        joinConversationRoom(chat.id);
        set((state) => ({ chats: mergeChat(state.chats, chat) }));
        return chat.id;
      },

      sendMessage: async (chatId, content, attachment) => {
        const profile = get().counselorProfile;
        const text = content.trim();
        if (!profile || (!text && !attachment)) return;

        const optimisticId = `optimistic-${crypto.randomUUID()}`;
        const optimistic: CounselorMessage = {
          id: optimisticId,
          chatId,
          senderId: profile.id,
          senderName: profile.displayName,
          content: text,
          attachment,
          timestamp: new Date(),
          optimistic: true,
        };

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, optimistic], lastMessageAt: optimistic.timestamp }
              : chat,
          ),
        }));

        try {
          const { message, conversation } = await sendChatMessage(chatId, {
            senderId: profile.id,
            senderRole: 'user',
            senderName: profile.displayName,
            text,
            attachment,
          });

          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...toChat(conversation, []),
                    messages: chat.messages.map((item) => (item.id === optimisticId ? toMessage(message) : item)),
                  }
                : chat,
            ),
          }));
        } catch (error) {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? { ...chat, messages: chat.messages.map((item) => (item.id === optimisticId ? { ...item, failed: true } : item)) }
                : chat,
            ),
          }));
          throw error;
        }
      },

      getChat: (chatId) => get().chats.find((c) => c.id === chatId),

      deleteChat: (chatId) => {
        leaveConversationRoom(chatId);
        set((state) => ({ chats: state.chats.filter((c) => c.id !== chatId) }));
      },

      getChatWithCounselor: (counselorId) => get().chats.find((c) => c.participants.includes(counselorId)),

      requestCounsellorSession: (counselorId) => {
        set((state) => ({
          sessionStatuses: { ...state.sessionStatuses, [counselorId]: state.sessionStatuses[counselorId] ?? 'requested' },
        }));
      },

      setSessionStatus: (counselorId, status) => {
        set((state) => ({
          sessionStatuses: { ...state.sessionStatuses, [counselorId]: status },
          appointments: state.appointments.map((appointment) =>
            appointment.counselorId === counselorId && appointment.status !== 'completed' && appointment.status !== 'cancelled'
              ? { ...appointment, status }
              : appointment,
          ),
        }));
      },

      getAvailableSlots: (counselorId, date) => {
        const booked = new Set(
          get().appointments
            .filter((appointment) => appointment.counselorId === counselorId && appointment.appointmentDate === date && appointment.status !== 'cancelled')
            .map((appointment) => appointment.slot),
        );
        return DEFAULT_SLOTS.filter((slot) => !booked.has(slot));
      },

      bookSession: async (counselorId, date, slot, consultationType, reminders, notes) => {
        if (!get().getAvailableSlots(counselorId, date).includes(slot)) return null;
        const profile = get().counselorProfile;
        if (!profile) return null;

        const { appointment } = await createAppointment({
          userId: profile.id,
          userName: profile.displayName,
          counselorId,
          appointmentDate: date,
          slot,
          consultationType,
          reminders,
          notes,
        });

        set((state) => ({
          appointments: [toLocalAppointment(appointment), ...state.appointments.filter((item) => item.id !== appointment.id)],
          sessionStatuses: { ...state.sessionStatuses, [counselorId]: 'requested' },
        }));

        get().registerClientWithCounselor(profile.id, profile.displayName);
        return appointment.id;
      },

      getAppointmentsForCounselor: (counselorId) => get().appointments.filter((appointment) => appointment.counselorId === counselorId),
      getLatestAppointmentForCounselor: (counselorId) => get().appointments.find((appointment) => appointment.counselorId === counselorId),

      registerClientWithCounselor: (userId, userName) => {
        set((state) => state.counselorClients.some((c) => c.userId === userId)
          ? state
          : { counselorClients: [...state.counselorClients, { userId, userName, joinedDate: new Date() }] });
      },

      getCounselorClients: () => get().counselorClients,

      confirmAppointment: (appointmentId) => set((state) => ({ appointments: state.appointments.map((a) => a.id === appointmentId ? { ...a, status: 'confirmed' } : a) })),
      cancelAppointment: (appointmentId) => set((state) => ({ appointments: state.appointments.map((a) => a.id === appointmentId ? { ...a, status: 'cancelled' } : a) })),
      completeAppointment: (appointmentId) => set((state) => ({ appointments: state.appointments.map((a) => a.id === appointmentId ? { ...a, status: 'completed' } : a) })),
      missAppointment: (appointmentId) => set((state) => ({ appointments: state.appointments.map((a) => a.id === appointmentId ? { ...a, status: 'missed' } : a) })),
      rescheduleAppointment: (appointmentId, newDate, newSlot, newConsultationType) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, appointmentDate: newDate, slot: newSlot, ...(newConsultationType ? { consultationType: newConsultationType } : {}), status: 'requested' }
              : appointment,
          ),
        }));
      },
    }),
    {
      name: 'wellmind-counselor-chat',
      version: 3,
      partialize: (state) => ({
        counselorProfile: state.counselorProfile,
        appointments: state.appointments,
        sessionStatuses: state.sessionStatuses,
      }),
    },
  ),
);
