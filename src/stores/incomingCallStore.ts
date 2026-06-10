import { create } from 'zustand';

export interface IncomingCall {
  id: string;
  conversationId: string;
  callerId: string;
  callerName: string;
  mode: 'video' | 'audio';
  offer: {
    sdp: string;
    type: RTCSdpType;
  };
  receivedAt: Date;
}

interface IncomingCallState {
  incomingCall: IncomingCall | null;
  setIncomingCall: (call: IncomingCall | null) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  acceptedCall: IncomingCall | null;
  rejectedAt: Date | null;
}

export const useIncomingCallStore = create<IncomingCallState>((set, get) => ({
  incomingCall: null,
  acceptedCall: null,
  rejectedAt: null,

  setIncomingCall: (call) => {
    set({ incomingCall: call, rejectedAt: null });
  },

  acceptCall: () => {
    const current = get().incomingCall;
    if (current) {
      set({ acceptedCall: current, incomingCall: null });
    }
  },

  rejectCall: () => {
    set({ incomingCall: null, rejectedAt: new Date() });
  },
}));
