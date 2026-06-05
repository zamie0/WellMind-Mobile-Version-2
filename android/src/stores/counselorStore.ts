import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CounsellorAppointment } from './peerChatStore';

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

const createInitialClients = (): CounselorClient[] => [
  {
    id: 'client-sarah',
    displayName: 'Sarah Johnson',
    isAnonymous: false,
    recentMood: 'Anxious',
    lastInteraction: new Date(),
    appointmentCount: 4,
    notes: 'Academic pressure and comparison with classmates. Responds well to small daily goals.',
  },
  {
    id: 'client-amir',
    displayName: 'Amir Rahman',
    isAnonymous: false,
    recentMood: 'Stressed',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 18),
    appointmentCount: 2,
    notes: 'Workload concerns. Explore sleep routine and boundaries.',
  },
  {
    id: 'client-anon',
    displayName: 'Anonymous Client',
    isAnonymous: true,
    recentMood: 'Low',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 42),
    appointmentCount: 1,
    notes: 'Prefers anonymous support. Keep questions gentle and concrete.',
  },
];

const createInitialSessions = (): CounselorSession[] => [
  {
    id: 'session-sarah-chat',
    clientId: 'client-sarah',
    clientName: 'Sarah Johnson',
    type: 'chat',
    startTime: new Date(Date.now() - 1000 * 60 * 9),
    status: 'in-progress',
  },
  {
    id: 'session-amir-video',
    clientId: 'client-amir',
    clientName: 'Amir Rahman',
    type: 'video',
    startTime: new Date(Date.now() - 1000 * 60 * 28),
    status: 'in-progress',
  },
];

const createInitialAppointments = (): CounsellorAppointment[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 'counselor-appt-1',
      peerId: 'client-sarah',
      appointmentDate: tomorrow.toISOString().split('T')[0],
      slot: '10:30 AM',
      consultationType: 'chat',
      reminders: { push: true, email: false, local: true },
      status: 'requested',
      notes: 'Follow-up on study stress.',
      persistence: 'local-mock',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'counselor-appt-2',
      peerId: 'client-amir',
      appointmentDate: nextWeek.toISOString().split('T')[0],
      slot: '02:00 PM',
      consultationType: 'video',
      reminders: { push: true, email: true, local: true },
      status: 'confirmed',
      notes: 'Review coping plan.',
      persistence: 'local-mock',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const useCounselorStore = create<CounselorStore>()(
  persist(
    (set, get) => ({
      clients: createInitialClients(),
      sessions: createInitialSessions(),
      activeChatId: null,
      availability: [],
      appointments: createInitialAppointments(),

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
          const client = appointment ? get().getClientById(appointment.peerId) : undefined;
          if (appointment && client) {
            const alreadyActive = get()
              .getActiveSessions()
              .some((session) => session.clientId === client.id && session.type === appointment.consultationType);

            if (!alreadyActive) {
              get().startSession(client.id, client.displayName, appointment.consultationType);
            }
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

        if (upcomingAppointments.length > 0) {
          return upcomingAppointments;
        }

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        return [
          {
            id: 'mock-appointment-1',
            peerId: 'mock-counselor-sarah',
            appointmentDate: tomorrow.toISOString(),
            slot: '10:30 AM',
            consultationType: 'video',
            reminders: {
              push: true,
              email: false,
              local: true,
            },
            status: 'confirmed',
            persistence: 'local-mock',
            createdAt: now.toISOString(),
          },
        ];
      },
    }),
    {
      name: 'wellmind-counselor',
    }
  )
);
