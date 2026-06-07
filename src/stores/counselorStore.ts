import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CounsellorAppointment } from './counselorChatStore';

export interface CounselorClient {
  id: string;
  displayName: string;
  isAnonymous: boolean;
  recentMood?: string;
  lastInteraction: Date;
  appointmentCount: number;
  notes?: string;
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
}

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
          clients: [...state.clients, client],
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
    }),
    {
      name: 'wellmind-counselor',
    }
  )
);
