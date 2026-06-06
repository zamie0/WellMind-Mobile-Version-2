import { EyeOff, User } from 'lucide-react';
import type { CounselorUser } from '@/types/wellmind';

export const getStatusColor = (status: CounselorUser['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-amber-400';
    default:
      return 'bg-red-400';
  }
};

export const getStatusPillStyle = (status: CounselorUser['status']) => {
  if (status === 'online') return { background: 'rgba(57,168,155,0.12)', color: '#39a89b' };
  if (status === 'away') return { background: 'rgba(251,191,36,0.12)', color: '#d97706' };
  return { background: 'rgba(239,68,68,0.1)', color: '#dc2626' };
};

interface CounselorAvatarProps {
  counselor: CounselorUser;
  size?: 'sm' | 'md' | 'lg';
}

export const CounselorAvatar = ({ counselor, size = 'md' }: CounselorAvatarProps) => {
  const dim = size === 'sm' ? 40 : size === 'lg' ? 64 : 48;
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  const src = counselor.avatarUrl;

  return (
    <div
      className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{
        width: dim,
        height: dim,
        background: src ? 'transparent' : 'rgba(57,168,155,0.12)',
        boxShadow: '0 2px 8px rgba(57,168,155,0.15)',
      }}
    >
      {src ? (
        <img src={src} alt={counselor.displayName} className="w-full h-full object-cover" />
      ) : counselor.isAnonymous ? (
        <EyeOff className={`${iconSize}`} style={{ color: '#39a89b' }} />
      ) : (
        <User className={`${iconSize}`} style={{ color: '#39a89b' }} />
      )}
    </div>
  );
};