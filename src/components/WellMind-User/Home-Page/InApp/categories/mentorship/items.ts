import type { InAppItem } from '@/types/wellmind';

export const mentorshipItems: InAppItem[] = [
  {
    id: 'ment-1',
    title: 'One-on-One Mentoring',
    description: 'Get paired with a mentor who has walked a similar path to support your journey.',
    category: 'mentorship',
    tags: ['mentoring', 'personal'],
    isPremium: true,
  },
  {
    id: 'ment-2',
    title: 'Peer Support Group',
    description: 'Connect with peers facing similar challenges for mutual support and growth.',
    category: 'mentorship',
    tags: ['peer-support', 'group'],
  },
  {
    id: 'ment-3',
    title: 'Professional Counselor Directory',
    description: 'Find licensed therapists and counselors specialized in various areas.',
    category: 'mentorship',
    tags: ['professional', 'counselors'],
  },
];

