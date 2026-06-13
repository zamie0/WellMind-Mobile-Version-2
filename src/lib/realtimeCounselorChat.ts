import { io, type Socket } from 'socket.io-client';
import { apiRequest, API_BASE_URL } from '@/lib/apiClient';
import type { ChatAttachment } from '@/types/wellmind';

export type ChatRole = 'user' | 'counselor';

export interface ChatConversation {
  id: string;
  userId: string;
  counselorId: string;
  userName: string;
  counselorName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadForUser: number;
  unreadForCounselor: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ChatRole;
  senderName: string;
  text: string;
  attachment?: ChatAttachment;
  isRead: boolean;
  createdAt: string;
  optimistic?: boolean;
  failed?: boolean;
}

let socket: Socket | null = null;
let lastIdentity: { role: ChatRole; participantId: string } | null = null;

export const getChatSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socket.on('connect', () => {
      if (lastIdentity) {
        socket?.emit('chat:identify', lastIdentity);
      }
    });
  }
  return socket;
};

export const identifyChatParticipant = (role: ChatRole, participantId: string) => {
  lastIdentity = { role, participantId };
  getChatSocket().emit('chat:identify', lastIdentity);
};

export const joinConversationRoom = (conversationId: string) => {
  getChatSocket().emit('conversation:join', { conversationId });
};

export const leaveConversationRoom = (conversationId: string) => {
  getChatSocket().emit('conversation:leave', { conversationId });
};

export const listConversations = (role: ChatRole, participantId: string) =>
  apiRequest<{ conversations: ChatConversation[] }>(
    `/api/chat/conversations?role=${encodeURIComponent(role)}&participantId=${encodeURIComponent(participantId)}`,
  );

export const getOrCreateConversation = (input: {
  userId: string;
  counselorId: string;
  userName: string;
}) =>
  apiRequest<{ conversation: ChatConversation }>('/api/chat/conversations', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const listMessages = (conversationId: string, limit = 100) =>
  apiRequest<{ messages: ChatMessage[] }>(
    `/api/chat/conversations/${conversationId}/messages?limit=${limit}`,
  );

export const sendChatMessage = (
  conversationId: string,
  input: {
    senderId: string;
    senderRole: ChatRole;
    senderName: string;
    text: string;
    attachment?: ChatAttachment;
  },
) =>
  apiRequest<{ message: ChatMessage; conversation: ChatConversation }>(
    `/api/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );

export interface WebRTCCallOffer {
  conversationId: string;
  callerId: string;
  callerName: string;
  targetId: string;
  targetRole: ChatRole;
  sdp: string;
  type: RTCSdpType;
  mode: 'video' | 'audio';
}

export interface WebRTCCallAnswer {
  conversationId: string;
  responderId: string;
  responderName: string;
  sdp: string;
  type: RTCSdpType;
  mode: 'video' | 'audio';
}

export interface WebRTCCandidate {
  conversationId: string;
  candidate: RTCIceCandidateInit;
}

export interface WebRTCCallEnd {
  conversationId: string;
}

export const sendCallOffer = (payload: WebRTCCallOffer) => {
  getChatSocket().emit('call:offer', payload);
};

export const sendCallAnswer = (payload: WebRTCCallAnswer) => {
  getChatSocket().emit('call:answer', payload);
};

export const sendIceCandidate = (payload: WebRTCCandidate) => {
  getChatSocket().emit('call:candidate', payload);
};

export const sendCallEnd = (payload: WebRTCCallEnd) => {
  getChatSocket().emit('call:end', payload);
};

export const markConversationRead = (conversationId: string, readerRole: ChatRole) =>
  apiRequest<{ conversation: ChatConversation }>(`/api/chat/conversations/${conversationId}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ readerRole }),
  });
