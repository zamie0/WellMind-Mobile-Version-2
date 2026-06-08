import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CounsellorAppointment } from './counselorChatStore';
import {
  listAppointments,
  updateAppointmentStatus as updateRemoteAppointmentStatus,
  type RemoteAppointment,
} from '@/lib/appointmentsApi';

export interface CounselorClient {
  id: string;
  conversationId?: string;
  displayName: string;
  isAnonymous: boolean;
  recentMood?: string;
  lastInteraction: Date;
  appointmentCount: number;
  notes?: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface CounselorAvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface CounselorSession {
  id: string;
  clientId: string;
  clientName: string;
  type: 'chat' | 'video';
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface CounselorStore {
  clients: CounselorClient[];
  sessions: CounselorSession[];
  activeChatId: string | null;
  availability: CounselorAvailabilitySlot[];
  appointments: CounsellorAppointment[];

  // Client Management
  addClient: (client: CounselorClient) => void;
  updateClient: (clientId: string, updates: Partial<CounselorClient>) => void;
  removeClient: (clientId: string) => void;
  getClients: () => CounselorClient[];
  getAllClients: () => CounselorClient[];
  getClientById: (clientId: string) => CounselorClient | undefined;

  // Session Management
  startSession: (clientId: string, clientName: string, type: 'chat' | 'video') => string;
  endSession: (sessionId: string) => void;
  getActiveSessions: () => CounselorSession[];
  getSessionHistory: (clientId?: string) => CounselorSession[];

  // Availability Management
  setAvailability: (slots: CounselorAvailabilitySlot[]) => void;
  getAvailability: () => CounselorAvailabilitySlot[];
  isAvailableNow: () => boolean;

  // Chat Management
  setActiveChat: (chatId: string | null) => void;
  getActiveChat: () => string | null;

  // Appointments
  addAppointment: (appointment: CounsellorAppointment) => void;
  updateAppointmentStatus: (appointmentId: string, status: 'requested' | 'confirmed' | 'completed' | 'cancelled') => void;
  getUpcomingAppointments: () => CounsellorAppointment[];
  loadAppointments: (counselorId: string) => Promise<void>;
  upsertClientsFromConversations: (conversations: Array<{
    id: string;
    userId: string;
    userName: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadForCounselor?: number;
  }>) => void;
  upsertAppointments: (appointments: RemoteAppointment[]) => void;
}

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

export const useCounselorStore = create<CounselorStore>()(
  persist(
    (set, get) => ({
      clients: [],
      sessions: [],
      activeChatId: null,
      availability: [],
      appointments: [],

      addClient: (client) => {
        set((state) => ({
          clients: state.clients.some((item) => item.id === client.id)
            ? state.clients.map((item) => item.id === client.id ? { ...item, ...client, notes: item.notes ?? client.notes } : item)
            : [...state.clients, client],
        }));
      },

      updateClient: (clientId, updates) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId ? { ...client, ...updates } : client
          ),
        }));
      },

      removeClient: (clientId) => {
        set((state) => {
          const remainingSessions = state.sessions.filter((s) => s.clientId !== clientId);
          const hasActiveChat = state.activeChatId
            ? remainingSessions.some((s) => s.id === state.activeChatId)
            : false;

          return {
            clients: state.clients.filter((client) => client.id !== clientId),
            sessions: remainingSessions,
            activeChatId: hasActiveChat ? state.activeChatId : null,
          };
        });
      },

      getClients: () => {
        return get().clients;
      },

      getAllClients: () => {
        return get().clients;
      },

      getClientById: (clientId) => {
        return get().clients.find((c) => c.id === clientId);
      },

      startSession: (clientId, clientName, type) => {
        const sessionId = crypto.randomUUID();
        const session: CounselorSession = {
          id: sessionId,
          clientId,
          clientName,
          type,
          startTime: new Date(),
          status: 'in-progress',
        };

        set((state) => ({
          sessions: [...state.sessions, session],
          activeChatId: sessionId,
        }));

        // Update client's last interaction
        get().updateClient(clientId, {
          lastInteraction: new Date(),
        });

        return sessionId;
      },

      endSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, endTime: new Date(), status: 'completed' }
              : s
          ),
          activeChatId: null,
        }));
      },

      getActiveSessions: () => {
        const inProgress = get().sessions.filter((s) => s.status === 'in-progress');

        const latestByClientAndType = new Map<string, CounselorSession>();
        for (const session of inProgress) {
          const key = `${session.clientId}-${session.type}`;
          const existing = latestByClientAndType.get(key);
          if (!existing || new Date(session.startTime).getTime() > new Date(existing.startTime).getTime()) {
            latestByClientAndType.set(key, session);
          }
        }

        return Array.from(latestByClientAndType.values());
      },

      getSessionHistory: (clientId?) => {
        const sessions = get().sessions;
        if (clientId) {
          return sessions.filter((s) => s.clientId === clientId && s.status === 'completed');
        }
        return sessions.filter((s) => s.status === 'completed');
      },

      setAvailability: (slots) => {
        set({ availability: slots });
      },

      getAvailability: () => {
        return get().availability;
      },

      isAvailableNow: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`;

        return get().availability.some(
          (slot) =>
            slot.dayOfWeek === dayOfWeek &&
            slot.startTime <= currentTime &&
            slot.endTime >= currentTime
        );
      },

      setActiveChat: (chatId) => {
        set({ activeChatId: chatId });
      },

      getActiveChat: () => {
        return get().activeChatId;
      },

      addAppointment: (appointment) => {
        set((state) => ({
          appointments: [...state.appointments, appointment],
        }));
      },

      updateAppointmentStatus: (appointmentId, status) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId ? { ...a, status } : a
          ),
        }));

        void updateRemoteAppointmentStatus(appointmentId, status).then(({ appointment }) => {
          get().upsertAppointments([appointment]);
        }).catch(() => {});

        if (status === 'confirmed') {
          const appointment = get().appointments.find((a) => a.id === appointmentId);
          if (!appointment || !appointment.clientId) return;

          let client = get().getClientById(appointment.clientId);
          if (!client) {
            client = {
              id: appointment.clientId,
              displayName: appointment.clientName ?? 'Client',
              isAnonymous: true,
              lastInteraction: new Date(),
              appointmentCount: 0,
            };
            set((state) => ({
              clients: [...state.clients, client],
            }));
          }

          const alreadyActive = get()
            .getActiveSessions()
            .some((session) => session.clientId === client!.id && session.type === appointment.consultationType);

          if (!alreadyActive) {
            get().startSession(client.id, client.displayName, appointment.consultationType);
          }
        }
      },

      getUpcomingAppointments: () => {
        const now = new Date();
        const upcomingAppointments = get()
          .appointments.filter((a) => {
            const appointmentDate = new Date(a.appointmentDate);
            return appointmentDate > now && a.status !== 'cancelled';
          })
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

        return upcomingAppointments;
      },

      loadAppointments: async (counselorId) => {
        const { appointments } = await listAppointments('counselor', counselorId);
        get().upsertAppointments(appointments);
      },

      upsertAppointments: (appointments) => {
        set((state) => {
          const byId = new Map(state.appointments.map((appointment) => [appointment.id, appointment]));
          const clientsById = new Map(state.clients.map((client) => [client.id, client]));

          appointments.forEach((appointment) => {
            byId.set(appointment.id, toLocalAppointment(appointment));
            const existing = clientsById.get(appointment.clientId);
            clientsById.set(appointment.clientId, {
              id: appointment.clientId,
              conversationId: existing?.conversationId,
              displayName: appointment.clientName || existing?.displayName || 'Anonymous client',
              isAnonymous: !appointment.clientName || appointment.clientName.toLowerCase().includes('anonymous'),
              recentMood: existing?.recentMood,
              lastInteraction: existing?.lastInteraction || new Date(appointment.createdAt),
              appointmentCount: Math.max(existing?.appointmentCount || 0, 1),
              notes: existing?.notes,
              lastMessage: existing?.lastMessage,
              unreadCount: existing?.unreadCount || 0,
            });
          });

          return {
            appointments: Array.from(byId.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            ),
            clients: Array.from(clientsById.values()).sort(
              (a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime(),
            ),
          };
        });
      },

      upsertClientsFromConversations: (conversations) => {
        set((state) => {
          const byId = new Map(state.clients.map((client) => [client.id, client]));

          conversations.forEach((conversation) => {
            const existing = byId.get(conversation.userId);
            byId.set(conversation.userId, {
              id: conversation.userId,
              conversationId: conversation.id,
              displayName: conversation.userName || existing?.displayName || 'Anonymous client',
              isAnonymous: !conversation.userName || conversation.userName.toLowerCase().includes('anonymous'),
              recentMood: existing?.recentMood,
              lastInteraction: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : existing?.lastInteraction || new Date(),
              appointmentCount: existing?.appointmentCount || 0,
              notes: existing?.notes,
              lastMessage: conversation.lastMessage || existing?.lastMessage,
              unreadCount: conversation.unreadForCounselor || 0,
            });
          });

          return {
            clients: Array.from(byId.values()).sort(
              (a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime(),
            ),
          };
        });
      },
    }),
    {
      name: 'wellmind-counselor',
    }
  )
);
