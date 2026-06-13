import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import {
  getChatSocket,
  joinConversationRoom,
  leaveConversationRoom,
  sendCallAnswer,
  sendCallEnd,
  sendCallOffer,
  sendIceCandidate,
  type ChatRole,
  type WebRTCCallAnswer,
  type WebRTCCallOffer,
  type WebRTCCandidate,
  type WebRTCCallEnd,
} from '@/lib/realtimeCounselorChat';
import { useIncomingCallStore } from '@/stores/incomingCallStore';

interface UseVideoCallOptions {
  conversationId?: string;
  localUserId?: string;
  localUserName?: string;
  localRole: ChatRole;
  onError?: (error: Error) => void;
  onIncomingCall?: (call: any) => void;
}

type CallMode = 'video' | 'audio';

export const useVideoCall = ({
  conversationId,
  localUserId,
  localUserName,
  localRole,
  onError,
}: UseVideoCallOptions) => {
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const [remoteUserName, setRemoteUserName] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected' | 'failed'
  >('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isCallInitiatorRef = useRef(false);

  const cleanupCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    pendingCandidatesRef.current = [];
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsAudioEnabled(true);
    setIsVideoEnabled(true);
    setConnectionState('connecting');
    setIsMinimized(false);
    setIsActive(false);
    isCallInitiatorRef.current = false;
  }, [localStream, remoteStream]);

  const attachRemoteStream = useCallback((event: RTCTrackEvent) => {
    const stream = remoteStream ?? new MediaStream();
    if (event.streams && event.streams[0]) {
      event.streams[0].getTracks().forEach((track) => stream.addTrack(track));
    } else {
      stream.addTrack(event.track);
    }
    setRemoteStream(stream);
  }, [remoteStream]);

  const preparePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && conversationId) {
        const candidatePayload: WebRTCCandidate = {
          conversationId,
          candidate: event.candidate.toJSON(),
        };
        sendIceCandidate(candidatePayload);
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState as
        | 'connecting'
        | 'connected'
        | 'disconnected'
        | 'failed';
      setConnectionState(state);
      if (state === 'connected') {
        setIsActive(true);
      }
      if (state === 'disconnected' || state === 'failed') {
        cleanupCall();
      }
    };

    pc.ontrack = attachRemoteStream;
    peerConnectionRef.current = pc;
    return pc;
  }, [attachRemoteStream, cleanupCall, conversationId]);

  const flushPendingCandidates = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    const candidates = pendingCandidatesRef.current.slice();
    pendingCandidatesRef.current = [];

    for (const candidateInit of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
      } catch (error) {
        console.warn('Failed to add queued ICE candidate', error);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsAudioEnabled((prev) => !prev);
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoEnabled((prev) => !prev);
  }, [localStream]);

  const createLocalStream = useCallback(
    async (mode: CallMode = 'video') => {
      const isNative = Capacitor.isNativePlatform();
      console.log('📹 Creating local stream:', { mode, isNative });

      // For native Android/iOS, request permissions first
      if (isNative) {
        try {
          console.log('📹 Requesting native Android permissions...');
          const permResult = await Camera.requestPermissions({
            permissions: ['camera', 'photos'],
          });

          if (permResult.camera !== 'granted') {
            throw new Error(
              'Camera permission denied. Please enable it in your phone settings (Settings > Apps > WellMind > Permissions > Camera).',
            );
          }
          console.log('📹 Permissions granted:', permResult);
        } catch (error) {
          console.error('📹 Permission request failed:', error);
          throw new Error(
            'Unable to access camera. Please enable camera permission in your phone settings.',
          );
        }
      }

      const constraints = {
        audio: true,
        video: mode === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      try {
        console.log('📹 Calling getUserMedia with constraints:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('📹 Stream obtained:', { videoTracks: stream.getVideoTracks().length, audioTracks: stream.getAudioTracks().length });
        
        setLocalStream(stream);
        setIsVideoEnabled(mode === 'video');
        const pc = preparePeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        console.log('📹 Tracks added to peer connection');
        return stream;
      } catch (error) {
        const err = error as DOMException;
        console.error('📹 getUserMedia failed:', { name: err.name, message: err.message });
        
        if (err.name === 'NotAllowedError') {
          throw new Error(
            'Camera/Microphone permissions denied. Please enable them in Settings > Apps > WellMind > Permissions.',
          );
        }
        if (err.name === 'NotFoundError') {
          throw new Error('Camera or microphone device not found on your device.');
        }
        throw error;
      }
    },
    [preparePeerConnection],
  );

  const handleIncomingOffer = useCallback(
    async (payload: WebRTCCallOffer) => {
      if (!conversationId || payload.conversationId !== conversationId) return;
      if (payload.callerId === localUserId) return;

      // Store incoming call and wait for user acceptance via UI
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
    },
    [conversationId, localUserId],
  );

  const handleIncomingAnswer = useCallback(
    async (payload: WebRTCCallAnswer) => {
      if (!conversationId || payload.conversationId !== conversationId) return;
      if (!peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.setRemoteDescription({ type: payload.type, sdp: payload.sdp });
        await flushPendingCandidates();
      } catch (error) {
        console.error('Failed to set remote answer', error);
      }
    },
    [conversationId, flushPendingCandidates],
  );

  const handleIncomingCandidate = useCallback(
    async (payload: WebRTCCandidate) => {
      if (!conversationId || payload.conversationId !== conversationId) return;
      const pc = peerConnectionRef.current;
      if (!pc || !payload.candidate) return;

      if (pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (error) {
          console.warn('Failed to add ICE candidate', error);
        }
        return;
      }

      pendingCandidatesRef.current.push(payload.candidate);
    },
    [conversationId],
  );

  const handleIncomingCallEnd = useCallback(
    (payload: WebRTCCallEnd) => {
      if (!conversationId || payload.conversationId !== conversationId) return;
      cleanupCall();
      setIsActive(false);
    },
    [conversationId, cleanupCall],
  );

  const startCall = useCallback(
    async (remoteId: string, remoteName: string, mode: CallMode = 'video') => {
      if (!conversationId) throw new Error('Unable to start call: no active conversation');
      if (!localUserId) throw new Error('Unable to start call: local user is not identified');
      if (!localUserName) throw new Error('Unable to start call: local user is missing a name');

      try {
        console.log('📞 Starting call:', { remoteId, remoteName, mode, conversationId });
        isCallInitiatorRef.current = true;
        
        console.log('📞 Requesting local stream...');
        await createLocalStream(mode);
        console.log('📞 Local stream obtained');
        
        setRemoteUserId(remoteId);
        setRemoteUserName(remoteName);
        setConnectionState('connecting');
        console.log('📞 Setting isActive to true');
        setIsActive(true);
        setIsMinimized(false);

        const pc = preparePeerConnection();
        console.log('📞 Peer connection prepared');
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('📞 Offer created and set as local description');

        const offerPayload: WebRTCCallOffer = {
          conversationId,
          callerId: localUserId,
          callerName: localUserName,
          targetId: remoteId,
          targetRole: localRole === 'user' ? 'counselor' : 'user',
          sdp: offer.sdp ?? '',
          type: offer.type,
          mode,
        };
        console.log('📞 Sending call offer via socket');
        sendCallOffer(offerPayload);
        console.log('📞 Call initiated successfully');
      } catch (error) {
        console.error('❌ Error in startCall:', error);
        const err = error instanceof Error ? error : new Error('Failed to start video call');
        onError?.(err);
        cleanupCall();
      }
    },
    [conversationId, createLocalStream, cleanupCall, localRole, localUserId, localUserName, onError, preparePeerConnection],
  );

  const acceptIncomingCall = useCallback(async () => {
    const { incomingCall, acceptedCall } = useIncomingCallStore.getState();
    const callToAccept = acceptedCall || incomingCall;
    if (!callToAccept || !conversationId || callToAccept.conversationId !== conversationId || !localUserId || !localUserName) return;

    try {
      const stream = await createLocalStream(callToAccept.mode);
      setRemoteUserId(callToAccept.callerId);
      setRemoteUserName(callToAccept.callerName);
      setConnectionState('connecting');
      setIsActive(true);
      setIsMinimized(false);

      const pc = preparePeerConnection();
      await pc.setRemoteDescription({ type: callToAccept.offer.type, sdp: callToAccept.offer.sdp });
      await flushPendingCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const answerPayload: WebRTCCallAnswer = {
        conversationId,
        responderId: localUserId,
        responderName: localUserName,
        sdp: answer.sdp ?? '',
        type: answer.type,
        mode: callToAccept.mode,
      };
      sendCallAnswer(answerPayload);
      useIncomingCallStore.setState({ acceptedCall: null, incomingCall: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to accept incoming call');
      onError?.(err);
      cleanupCall();
    }
  }, [conversationId, localUserId, localUserName, createLocalStream, preparePeerConnection, flushPendingCandidates, onError, cleanupCall]);

  const endCall = useCallback(() => {

    if (conversationId) {
      sendCallEnd({ conversationId });
    }
    cleanupCall();
    setIsActive(false);
  }, [cleanupCall, conversationId]);

  useEffect(() => {
    if (!conversationId) return undefined;
    joinConversationRoom(conversationId);
    const socket = getChatSocket();

    // Note: call:offer is handled globally by useGlobalCallListener
    // to ensure notifications work regardless of which conversation is open
    socket.on('call:answer', handleIncomingAnswer);
    socket.on('call:candidate', handleIncomingCandidate);
    socket.on('call:end', handleIncomingCallEnd);

    return () => {
      if (conversationId) leaveConversationRoom(conversationId);
      socket.off('call:answer', handleIncomingAnswer);
      socket.off('call:candidate', handleIncomingCandidate);
      socket.off('call:end', handleIncomingCallEnd);
      cleanupCall();
    };
  }, [conversationId, handleIncomingAnswer, handleIncomingCallEnd, handleIncomingCandidate, cleanupCall]);

  return {
    isActive,
    isMinimized,
    localStream,
    remoteStream,
    remoteUserId,
    remoteUserName,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    startCall,
    endCall,
    acceptIncomingCall,
    toggleMinimize: useCallback(() => {
      setIsMinimized((prev) => !prev);
    }, []),
    toggleAudio,
    toggleVideo,
  };
};

export default useVideoCall;
