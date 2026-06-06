import type { CounselorMessage } from '@/types/wellmind';

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (iso: string, slot: string) => `${formatDate(iso)} · ${slot}`;

export const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

export const formatMessageContent = (content: CounselorMessage['content']) =>
  typeof content === 'string' ? content : 'Encrypted message';
