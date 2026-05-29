import type { InAppCategory } from '@/types/wellmind';

export const programsMeta = {
  id: 'programs' as const satisfies InAppCategory,
  name: 'Programs & Challenges',
  description: 'Structured wellness programs (30-day challenges, etc.)',
  icon: '🎯',
  tileClassName: 'bg-gradient-to-br from-emerald-400/20 to-teal-500/20',
};

