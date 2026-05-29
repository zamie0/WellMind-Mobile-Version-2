import type { InAppCategory } from '@/types/wellmind';

export const volunteeringMeta = {
  id: 'volunteering' as const satisfies InAppCategory,
  name: 'Volunteering',
  description: 'Ways to give back and help others',
  icon: '🤝',
  tileClassName: 'bg-gradient-to-br from-rose-400/20 to-orange-500/20',
};

