import { EyeOff, User } from 'lucide-react';
import type { CounselorUser } from '@/types/wellmind';

const COUNSELOR_AVATAR: Record<string, string> = {
  'counselor-1': '/khoo.jpeg',
  'counselor-2': 'https://api.dicebear.com/9.x/lorelei/svg?seed=AinaYusuf',
  'counselor-3': 'https://api.dicebear.com/9.x/lorelei/svg?seed=DanielTan',
  'counselor-4': 'https://api.dicebear.com/9.x/lorelei/svg?seed=MeiLin',
  'counselor-5': 'https://api.dicebear.com/9.x/lorelei/svg?seed=RaviNair',
};

export const getStatusColor = (status: CounselorUser['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-amber-500';
    default:
      return 'bg-red-500';
  }
};

export const getStatusPillClass = (status: CounselorUser['status']) => {
  if (status === 'online') return 'bg-green-100 text-green-700';
  if (status === 'away') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

interface CounselorAvatarProps {
  counselor: CounselorUser;
  size?: 'sm' | 'md' | 'lg';
}

export const CounselorAvatar = ({ counselor, size = 'md' }: CounselorAvatarProps) => {
  const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  const src = COUNSELOR_AVATAR[counselor.id];

  return (
    <div className={`${sizeClass} rounded-full bg-sage-light flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {src ? (
        <img src={src} alt={counselor.displayName} className="w-full h-full object-cover" />
      ) : counselor.isAnonymous ? (
        <EyeOff className={`${iconSize} text-sage`} />
      ) : (
        <User className={`${iconSize} text-sage`} />
      )}
    </div>
  );
};
