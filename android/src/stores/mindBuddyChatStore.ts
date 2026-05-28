import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';
import type { EmotionLabel } from '@/lib/azureOpenAI';

export interface MindBuddyMessage {
  id: string;
  content: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
  emotion?: EmotionLabel;
}

interface MindBuddyChatState {
  messages: MindBuddyMessage[];
  lastEmotion: EmotionLabel | null;
  addMessage: (message: MindBuddyMessage) => void;
  setLastEmotion: (emotion: EmotionLabel) => void;
  clearHistory: () => void;
}

export const useMindBuddyChatStore = create<MindBuddyChatState>()(
  persist(
    (set) => ({
      messages: [],
      lastEmotion: null,

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      setLastEmotion: (emotion) => {
        set({ lastEmotion: emotion });
      },

      clearHistory: () => {
        set({ messages: [], lastEmotion: null });
      },
    }),
    {
      name: 'wellmind-mindbuddy-chat',
    }
  )
);
