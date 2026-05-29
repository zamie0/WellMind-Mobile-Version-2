import type { InAppCategory } from '@/types/wellmind';

export const communityMeta = {
  id: 'community' as const satisfies InAppCategory,
  name: 'Community',
  description: 'Peer support groups and connections',
  icon: '👥',
  tileClassName: 'bg-gradient-to-br from-sky-400/20 to-blue-500/20',
};

