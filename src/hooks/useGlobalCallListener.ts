import { useEffect } from 'react';
import { getChatSocket, identifyChatParticipant } from '@/lib/realtimeCounselorChat';
import { useAuthStore } from '@/stores/authStore';
import { useIncomingCallStore } from '@/stores/incomingCallStore';
import { showAppNotification } from '@/lib/nativeNotifications';
import type { ChatMessage, WebRTCCallOffer } from '@/lib/realtimeCounselorChat';

/**
 * Global hook to listen for incoming calls regardless of which conversation is active.
 * This must be used at the app root level to ensure call notifications work everywhere.
 */
export const useGlobalCallListener = () => {
  const { currentSession } = useAuthStore();

  useEffect(() => {
    if (!currentSession.isAuthenticated || !currentSession.userRole || !currentSession.currentUserId) return;
    identifyChatParticipant(currentSession.userRole, currentSession.currentUserId);
  }, [currentSession.currentUserId, currentSession.isAuthenticated, currentSession.userRole]);

  useEffect(() => {
    const socket = getChatSocket();

    const handleIncomingOffer = (payload: WebRTCCallOffer) => {
      const { currentSession } = useAuthStore.getState();
      if (!currentSession.isAuthenticated || !currentSession.userRole || !currentSession.currentUserId) return;
      if (payload.callerId === currentSession.currentUserId) return;
      if (payload.targetId && payload.targetId !== currentSession.currentUserId) return;
      if (payload.targetRole && payload.targetRole !== currentSession.userRole) return;

      // Store incoming call to show notification
      const incomingCallId = `call-${payload.conversationId}-${payload.callerId}-${Date.now()}`;
      useIncomingCallStore.setState({
        incomingCall: {
          id: incomingCallId,
          conversationId: payload.conversationId,
          callerId: payload.callerId,
          callerName: payload.callerName,
          mode: payload.mode,
          offer: { sdp: payload.sdp, type: payload.type },
          receivedAt: new Date(),
        },
      });

      void showAppNotification(
        `Incoming ${payload.mode === 'video' ? 'video' : 'audio'} call`,
        `${payload.callerName} is calling you.`,
        { type: 'call', conversationId: payload.conversationId },
      );
    };

    const handleNewMessage = (message: ChatMessage) => {
      const { currentSession } = useAuthStore.getState();
      if (!currentSession.isAuthenticated || !currentSession.currentUserId) return;
      if (message.senderId === currentSession.currentUserId) return;

      const senderName = message.senderName || (message.senderRole === 'counselor' ? 'Counselor' : 'Client');
      const body = message.text || (message.attachment ? `Sent ${message.attachment.type === 'image' ? 'an image' : message.attachment.name}` : 'Sent a message');

      void showAppNotification(
        `New message from ${senderName}`,
        body,
        { type: 'message', conversationId: message.conversationId },
      );
    };

    socket.on('call:offer', handleIncomingOffer);
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('call:offer', handleIncomingOffer);
      socket.off('message:new', handleNewMessage);
    };
  }, []);
};
