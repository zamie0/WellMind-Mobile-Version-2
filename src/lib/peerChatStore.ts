import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PeerUser,
  PeerChat,
  PeerMessage,
  SessionBooking,
  ConsultationType,
  ReminderChannel,
  EncryptedPayload,
} from '@/types/wellmind';
import {
  ensureIdentity,
  ensurePeerPublicKey,
  encryptMessage,
} from '@/lib/e2eCrypto';

interface PeerChatState {
  peerProfile: PeerUser | null;
  availablePeers: PeerUser[];
  chats: PeerChat[];
  bookings: SessionBooking[];

  createPeerProfile: (displayName: string, isAnonymous: boolean, bio?: string, supportTopics?: string[]) => void;
  updatePeerProfile: (updates: Partial<PeerUser>) => void;
  loadAvailablePeers: () => void;

  startChat: (peerId: string) => Promise<string>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  getChat: (chatId: string) => PeerChat | undefined;
  getChatWithPeer: (peerId: string) => PeerChat | undefined;

  simulatePeerResponse: (chatId: string) => Promise<void>;
  ingestRemoteMessage: (chatId: string, message: PeerMessage) => void;

  bookSession: (input: {
    peerId: string;
    preferredDate: Date;
    consultationType: ConsultationType;
    reminders: ReminderChannel[];
    notes?: string;
  }) => SessionBooking | null;
  cancelBooking: (bookingId: string) => void;
}

const SIMULATED_PEERS: PeerUser[] = [
  { id: 'peer-1', displayName: 'Alex', isAnonymous: false, status: 'online',
    bio: 'Here to listen and support. Been through anxiety myself.',
    supportTopics: ['Anxiety', 'Stress', 'Work-life balance'], joinedAt: new Date('2024-01-15') },
  { id: 'peer-2', displayName: 'Anonymous Helper', isAnonymous: true, status: 'online',
    bio: "Sometimes talking to a stranger helps. I'm here for you.",
    supportTopics: ['Depression', 'Loneliness', 'Life transitions'], joinedAt: new Date('2024-02-20') },
  { id: 'peer-3', displayName: 'Sam', isAnonymous: false, status: 'away',
    bio: 'Student counselor. Happy to chat about anything.',
    supportTopics: ['Academic stress', 'Relationships', 'Self-esteem'], joinedAt: new Date('2024-03-10') },
  { id: 'peer-4', displayName: 'Jordan', isAnonymous: false, status: 'online',
    bio: "Mental health advocate. Let's talk!",
    supportTopics: ['General support', 'Mindfulness', 'Coping strategies'], joinedAt: new Date('2024-04-05') },
  { id: 'peer-5', displayName: 'Anonymous Listener', isAnonymous: true, status: 'busy',
    bio: 'No judgment here. Share what\'s on your mind.',
    supportTopics: ['Family issues', 'Grief', 'Personal growth'], joinedAt: new Date('2024-05-12') },
];

const PEER_RESPONSES = [
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
    channel = new BroadcastChannel('wellmind-peer-chat-rt');
    channel.onmessage = (e) => {
      const { chatId, message } = e.data || {};
      if (chatId && message) {
        usePeerChatStore.getState().ingestRemoteMessage(chatId, message);
      }
    };
  }
  return channel;
};

export const usePeerChatStore = create<PeerChatState>()(
  persist(
    (set, get) => ({
      peerProfile: null,
      availablePeers: [],
      chats: [],
      bookings: [],

      bookSession: ({ peerId, preferredDate, consultationType, reminders, notes }) => {
        const peer = get().availablePeers.find((p) => p.id === peerId);
        if (!peer) return null;
        const booking: SessionBooking = {
          id: `booking-${crypto.randomUUID()}`,
          peerId, peerName: peer.displayName, preferredDate,
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
                  new Notification('Upcoming peer session', {
                    body: `Session with ${peer.displayName} in 15 minutes`,
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

      createPeerProfile: (displayName, isAnonymous, bio, supportTopics) => {
        const profile: PeerUser = {
          id: `user-${crypto.randomUUID()}`,
          displayName: isAnonymous ? 'Anonymous' : displayName,
          isAnonymous, status: 'online', bio,
          supportTopics: supportTopics || [],
          joinedAt: new Date(),
        };
        set({ peerProfile: profile });
        // Generate this user's E2E keypair eagerly
        ensureIdentity(profile.id).catch(() => {});
      },

      updatePeerProfile: (updates) => {
        set((state) => ({
          peerProfile: state.peerProfile ? { ...state.peerProfile, ...updates } : null,
        }));
      },

      loadAvailablePeers: () => {
        set({ availablePeers: SIMULATED_PEERS });
        // Ensure each peer has a public key registered (auto-generated for simulated peers).
        SIMULATED_PEERS.forEach((p) => { ensurePeerPublicKey(p.id).catch(() => {}); });
      },

      startChat: async (peerId) => {
        const existingChat = get().getChatWithPeer(peerId);
        if (existingChat) return existingChat.id;

        const peer = get().availablePeers.find((p) => p.id === peerId);
        const profile = get().peerProfile;
        if (!peer || !profile) return '';

        await ensureIdentity(profile.id);
        await ensurePeerPublicKey(peer.id);

        const chat: PeerChat = {
          id: `chat-${crypto.randomUUID()}`,
          participants: [profile.id, peerId],
          participantNames: [profile.displayName, peer.displayName],
          messages: [],
          createdAt: new Date(),
          lastMessageAt: new Date(),
        };
        set((state) => ({ chats: [...state.chats, chat] }));
        return chat.id;
      },

      sendMessage: async (chatId, content) => {
        const profile = get().peerProfile;
        if (!profile) return;
        const chat = get().getChat(chatId);
        if (!chat) return;
        const peerId = chat.participants.find((p) => p !== profile.id);
        if (!peerId) return;

        const cipher: EncryptedPayload = await encryptMessage(profile.id, peerId, content);

        const message: PeerMessage = {
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

        setTimeout(() => { get().simulatePeerResponse(chatId); }, 2000 + Math.random() * 3000);
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
      getChatWithPeer: (peerId) => get().chats.find((c) => c.participants.includes(peerId)),

      simulatePeerResponse: async (chatId) => {
        const chat = get().getChat(chatId);
        const profile = get().peerProfile;
        if (!chat || !profile) return;
        const peerId = chat.participants.find((p) => p !== profile.id);
        const peer = get().availablePeers.find((p) => p.id === peerId);
        if (!peer) return;

        const text = PEER_RESPONSES[Math.floor(Math.random() * PEER_RESPONSES.length)];
        // The simulated peer encrypts using its own (locally-stored) keypair toward our public key.
        const cipher = await encryptMessage(peer.id, profile.id, text);

        const response: PeerMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId, senderId: peer.id, senderName: peer.displayName,
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
    { name: 'wellmind-peer-chat' }
  )
);

// Init channel listener on import (client side).
if (typeof window !== 'undefined') getChannel();
