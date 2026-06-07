import { motion } from 'framer-motion';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { CounselorAvatar, getStatusColor } from './CounselorAvatar';
import { formatMessageContent, formatTime } from './CounselorSupportChat.utils';
import type { CounselorChat, CounselorUser } from '@/types/wellmind';

interface CounselorBrowseChatsProps {
  chats: CounselorChat[];
  availableCounselors: CounselorUser[];
  setActiveChatId: (chatId: string) => void;
  setView: (view: 'setup' | 'counselors' | 'chat') => void;
}

const EmptyState = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
  >
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center"
      style={{ background: 'rgba(57,168,155,0.1)' }}
    >
      {icon}
    </div>
    <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>{title}</p>
    <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#8fa3b1' }}>{desc}</p>
  </motion.div>
);

export const CounselorBrowseChats = ({
  chats,
  availableCounselors,
  setActiveChatId,
  setView,
}: CounselorBrowseChatsProps) => {
  if (chats.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle className="h-6 w-6" style={{ color: '#39a89b' }} />}
        title="No conversations yet"
        desc="Start a chat with a counselor from the Counselors tab."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {chats.map((chat, i) => {
        const counselor = availableCounselors.find((p) => chat.participants.includes(p.id));
        if (!counselor) return null;
        const lastMessage = chat.messages[chat.messages.length - 1];
        return (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { setActiveChatId(chat.id); setView('chat'); }}
            whileTap={{ scale: 0.985 }}
            className="w-full rounded-2xl p-4 flex items-center gap-3.5 text-left"
            style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.055)' }}
          >
            <div className="relative flex-shrink-0">
              <CounselorAvatar counselor={counselor} size="md" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(counselor.status)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: '#1a2b38' }}>{counselor.displayName}</p>
              {lastMessage && (
                <p className="text-xs truncate mt-0.5" style={{ color: '#8fa3b1' }}>
                  {formatMessageContent(lastMessage.content)}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-[11px]" style={{ color: '#b0c0cc' }}>
                {formatTime(chat.lastMessageAt)}
              </span>
              <ChevronRight className="h-3.5 w-3.5" style={{ color: '#c8d8e0' }} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};