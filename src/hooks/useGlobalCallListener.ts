import { useEffect } from 'react';
import { getChatSocket } from '@/lib/realtimeCounselorChat';
import { useIncomingCallStore } from '@/stores/incomingCallStore';
import type { WebRTCCallOffer } from '@/lib/realtimeCounselorChat';

/**
 * Global hook to listen for incoming calls regardless of which conversation is active.
 * This must be used at the app root level to ensure call notifications work everywhere.
 */
export const useGlobalCallListener = () => {
  useEffect(() => {
    const socket = getChatSocket();

    const handleIncomingOffer = (payload: WebRTCCallOffer) => {
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
    };

    socket.on('call:offer', handleIncomingOffer);

    return () => {
      socket.off('call:offer', handleIncomingOffer);
    };
  }, []);
};
