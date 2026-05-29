import type { InAppCategory } from '@/types/wellmind';

export const selfcareMeta = {
  id: 'selfcare' as const satisfies InAppCategory,
  name: 'Self-Care & Activities',
  description: 'Personal tools like meditation, tracking, wellness ideas',
  icon: '🧘',
  tileClassName: 'bg-gradient-to-br from-violet-400/15 to-fuchsia-500/15',
};

