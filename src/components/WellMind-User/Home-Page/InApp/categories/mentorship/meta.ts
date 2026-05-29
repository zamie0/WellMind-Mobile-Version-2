import type { InAppCategory } from '@/types/wellmind';

export const mentorshipMeta = {
  id: 'mentorship' as const satisfies InAppCategory,
  name: 'Mentorship & Support',
  description: 'Professional counselors, peer support, one-on-one mentoring',
  icon: '🌟',
  tileClassName: 'bg-gradient-to-br from-emerald-400/15 to-lime-500/15',
};

