import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CommunityState {
  joinedCommunities: string[];
  volunteerSignups: string[];
  enrolledPrograms: string[];
  savedResources: string[];
  rsvpEvents: string[];
  mentorRequests: string[];
  toggle: (key: keyof Omit<CommunityState, 'toggle'>, id: string) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      joinedCommunities: [],
      volunteerSignups: [],
      enrolledPrograms: [],
      savedResources: [],
      rsvpEvents: [],
      mentorRequests: [],
      toggle: (key, id) => {
        const list = get()[key] as string[];
        const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
        set({ [key]: next } as any);
      },
    }),
    { name: 'wellmind-community' }
  )
);
