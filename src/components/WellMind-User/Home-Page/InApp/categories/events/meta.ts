import type { InAppCategory } from '@/types/wellmind';

export const eventsMeta = {
  id: 'events' as const satisfies InAppCategory,
  name: 'Events & Meetups',
  description: 'Local gatherings, yoga sessions, awareness weeks',
  icon: '🎉',
  tileClassName: 'bg-gradient-to-br from-pink-400/15 to-rose-500/15',
};

