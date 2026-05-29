import type { InAppItem } from '@/types/wellmind';

export const programsItems: InAppItem[] = [
  {
    id: 'prog-1',
    title: '30-Day Mindfulness Challenge',
    description: 'Build a mindfulness habit with daily 10-minute guided exercises and tracking.',
    category: 'programs',
    tags: ['challenge', '30-days', 'mindfulness'],
  },
  {
    id: 'prog-2',
    title: 'Stress Management Masterclass',
    description: 'Learn evidence-based techniques to manage stress and anxiety effectively.',
    category: 'programs',
    tags: ['course', 'stress-management'],
    isPremium: true,
  },
  {
    id: 'prog-3',
    title: 'Sleep & Recovery Program',
    description: 'Improve sleep quality and establish healthy recovery habits.',
    category: 'programs',
    tags: ['sleep', 'health', '8-weeks'],
  },
];

