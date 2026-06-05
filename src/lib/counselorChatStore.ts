import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CounselorUser,
  CounselorChat,
  CounselorMessage,
  SessionBooking,
  ConsultationType,
  ReminderChannel,
  EncryptedPayload,
} from '@/types/wellmind';
import {
  ensureIdentity,
  ensureCounselorPublicKey,
  encryptMessage,
} from '@/lib/e2eCrypto';

interface CounselorChatState {
  counselorProfile: CounselorUser | null;
  availableCounselors: CounselorUser[];
  chats: CounselorChat[];
  bookings: SessionBooking[];

  createCounselorProfile: (displayName: string, isAnonymous: boolean, bio?: string, supportTopics?: string[]) => void;
  updateCounselorProfile: (updates: Partial<CounselorUser>) => void;
  loadAvailableCounselors: () => void;

  startChat: (counselorId: string) => Promise<string>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  getChat: (chatId: string) => CounselorChat | undefined;
  getChatWithCounselor: (counselorId: string) => CounselorChat | undefined;

  simulateCounselorResponse: (chatId: string) => Promise<void>;
  ingestRemoteMessage: (chatId: string, message: CounselorMessage) => void;

  bookSession: (input: {
    counselorId: string;
    preferredDate: Date;
    consultationType: ConsultationType;
    reminders: ReminderChannel[];
    notes?: string;
  }) => SessionBooking | null;
  cancelBooking: (bookingId: string) => void;
}

const SIMULATED_COUNSELORS: CounselorUser[] = [
  { id: 'counselor-1', displayName: 'Alex', isAnonymous: false, status: 'online',
    bio: 'Here to listen and support. Been through anxiety myself.',
    supportTopics: ['Anxiety', 'Stress', 'Work-life balance'], joinedAt: new Date('2024-01-15') },
  { id: 'counselor-2', displayName: 'Anonymous Helper', isAnonymous: true, status: 'online',
    bio: "Sometimes talking to a stranger helps. I'm here for you.",
    supportTopics: ['Depression', 'Loneliness', 'Life transitions'], joinedAt: new Date('2024-02-20') },
  { id: 'counselor-3', displayName: 'Sam', isAnonymous: false, status: 'away',
    bio: 'Student counselor. Happy to chat about anything.',
    supportTopics: ['Academic stress', 'Relationships', 'Self-esteem'], joinedAt: new Date('2024-03-10') },
  { id: 'counselor-4', displayName: 'Jordan', isAnonymous: false, status: 'online',
    bio: "Mental health advocate. Let's talk!",
    supportTopics: ['General support', 'Mindfulness', 'Coping strategies'], joinedAt: new Date('2024-04-05') },
  { id: 'counselor-5', displayName: 'Anonymous Listener', isAnonymous: true, status: 'busy',
    bio: 'No judgment here. Share what\'s on your mind.',
    supportTopics: ['Family issues', 'Grief', 'Personal growth'], joinedAt: new Date('2024-05-12') },
];

const COUNSELOR_RESPONSES = [
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

// Cross-tab realtime channel. Tabs broadcast new encrypted messages so all
// open instances of the app stay in sync without a server.
let channel: BroadcastChannel | null = null;
const getChannel = () => {
  if (typeof window === 'undefined') return null;
  if (!channel && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('wellmind-counselor-chat-rt');
    channel.onmessage = (e) => {
      const { chatId, message } = e.data || {};
      if (chatId && message) {
          useCounselorChatStore.getState().ingestRemoteMessage(chatId, message);
      }
    };
  }
  return channel;
};

  export const useCounselorChatStore = create<CounselorChatState>()(
  persist(
    (set, get) => ({
        counselorProfile: null,
        availableCounselors: [],
        chats: [],
        bookings: [],

      bookSession: ({ counselorId, preferredDate, consultationType, reminders, notes }) => {
        const counselor = get().availableCounselors.find((p) => p.id === counselorId);
        if (!counselor) return null;
        const booking: SessionBooking = {
          id: `booking-${crypto.randomUUID()}`,
          counselorId, counselorName: counselor.displayName, preferredDate,
          consultationType, reminders, notes,
          status: 'pending', createdAt: new Date(),
        };
        set((state) => ({ bookings: [...state.bookings, booking] }));
        if (reminders.includes('local')) {
          const ms = new Date(preferredDate).getTime() - Date.now() - 15 * 60 * 1000;
          if (ms > 0 && ms < 2_147_483_647) {
            setTimeout(() => {
              try {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Upcoming counselor session', {
                    body: `Session with ${counselor.displayName} in 15 minutes`,
                  });
                }
              } catch {}
            }, ms);
          }
        }
        return booking;
      },

      cancelBooking: (bookingId) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        }));
      },

      createCounselorProfile: (displayName, isAnonymous, bio, supportTopics) => {
        const profile: CounselorUser = {
          id: `user-${crypto.randomUUID()}`,
          displayName: isAnonymous ? 'Anonymous' : displayName,
          isAnonymous, status: 'online', bio,
          supportTopics: supportTopics || [],
          joinedAt: new Date(),
        };
        set({ counselorProfile: profile });
        // Generate this user's E2E keypair eagerly
        ensureIdentity(profile.id).catch(() => {});
      },

      updateCounselorProfile: (updates) => {
        set((state) => ({
          counselorProfile: state.counselorProfile ? { ...state.counselorProfile, ...updates } : null,
        }));
      },

      loadAvailableCounselors: () => {
        set({ availableCounselors: SIMULATED_COUNSELORS });
        // Ensure each counselor has a public key registered (auto-generated for simulated counselors).
        SIMULATED_COUNSELORS.forEach((p) => { ensureCounselorPublicKey(p.id).catch(() => {}); });
      },

      startChat: async (counselorId) => {
        const existingChat = get().getChatWithCounselor(counselorId);
        if (existingChat) return existingChat.id;

        const counselor = get().availableCounselors.find((p) => p.id === counselorId);
        const profile = get().counselorProfile;
        if (!counselor || !profile) return '';

        await ensureIdentity(profile.id);
        await ensureCounselorPublicKey(counselor.id);

        const chat: CounselorChat = {
          id: `chat-${crypto.randomUUID()}`,
          participants: [profile.id, counselorId],
          participantNames: [profile.displayName, counselor.displayName],
          messages: [],
          createdAt: new Date(),
          lastMessageAt: new Date(),
        };
        set((state) => ({ chats: [...state.chats, chat] }));
        return chat.id;
      },

      sendMessage: async (chatId, content) => {
        const profile = get().counselorProfile;
        if (!profile) return;
        const chat = get().getChat(chatId);
        if (!chat) return;
        const counselorId = chat.participants.find((p) => p !== profile.id);
        if (!counselorId) return;

        const cipher: EncryptedPayload = await encryptMessage(profile.id, counselorId, content);

        const message: CounselorMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId, senderId: profile.id, senderName: profile.displayName,
          content: cipher, timestamp: new Date(),
        };

        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, message], lastMessageAt: new Date() }
              : c
          ),
        }));

        getChannel()?.postMessage({ chatId, message });

        setTimeout(() => { get().simulateCounselorResponse(chatId); }, 2000 + Math.random() * 3000);
      },

      ingestRemoteMessage: (chatId, message) => {
        set((state) => {
          const target = state.chats.find((c) => c.id === chatId);
          if (!target) return state;
          if (target.messages.some((m) => m.id === message.id)) return state;
          return {
            chats: state.chats.map((c) =>
              c.id === chatId
                ? { ...c, messages: [...c.messages, message], lastMessageAt: new Date() }
                : c
            ),
          };
        });
      },

      getChat: (chatId) => get().chats.find((c) => c.id === chatId),
      getChatWithCounselor: (counselorId) => get().chats.find((c) => c.participants.includes(counselorId)),

      simulateCounselorResponse: async (chatId) => {
        const chat = get().getChat(chatId);
        const profile = get().counselorProfile;
        if (!chat || !profile) return;
        const counselorId = chat.participants.find((p) => p !== profile.id);
        const counselor = get().availableCounselors.find((p) => p.id === counselorId);
        if (!counselor) return;

        const text = COUNSELOR_RESPONSES[Math.floor(Math.random() * COUNSELOR_RESPONSES.length)];
        // The simulated counselor encrypts using its own (locally-stored) keypair toward our public key.
        const cipher = await encryptMessage(counselor.id, profile.id, text);

        const response: CounselorMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId, senderId: counselor.id, senderName: counselor.displayName,
          content: cipher, timestamp: new Date(),
        };

        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, response], lastMessageAt: new Date() }
              : c
          ),
        }));

        getChannel()?.postMessage({ chatId, message: response });
      },
    }),
    { name: 'wellmind-counselor-chat' }
  )
);

// Init channel listener on import (client side).
if (typeof window !== 'undefined') getChannel();
