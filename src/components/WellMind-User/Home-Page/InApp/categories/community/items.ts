import type { InAppItem } from '@/types/wellmind';

export const communityItems: InAppItem[] = [
  {
    id: 'comm-1',
    title: 'Mental Health Circle',
    description: 'Weekly peer support group for sharing and connecting with others on similar journeys.',
    category: 'community',
    tags: ['peer-support', 'weekly', 'free'],
  },
  {
    id: 'comm-2',
    title: 'WellMind Discord Community',
    description: 'Join our online community to chat, share resources, and find support anytime.',
    category: 'community',
    tags: ['online', 'chat', '24/7'],
    link: '#',
  },
  {
    id: 'comm-3',
    title: 'Local Support Groups',
    description: 'Find support groups meeting in your area for specific challenges.',
    category: 'community',
    tags: ['local', 'in-person'],
  },
];

