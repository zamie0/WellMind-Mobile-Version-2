import type { InAppCategory } from '@/types/wellmind';

export const resourcesMeta = {
  id: 'resources' as const satisfies InAppCategory,
  name: 'Resources & Learning',
  description: 'Educational materials and handbooks',
  icon: '📚',
  tileClassName: 'bg-gradient-to-br from-amber-400/20 to-yellow-500/20',
};

