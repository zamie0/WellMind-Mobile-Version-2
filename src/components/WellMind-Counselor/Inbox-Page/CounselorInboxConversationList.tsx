import { motion } from 'framer-motion';
import { MessageSquare, UserRound } from 'lucide-react';
import type { ChatConversation } from '@/lib/realtimeCounselorChat';

interface CounselorInboxConversationListProps {
  conversations: ChatConversation[];
  isLoading: boolean;
  onSelectConversation: (conversationId: string) => void;
  onSearch?: (query: string) => void;
  query?: string;
}

export const CounselorInboxConversationList = ({
  conversations,
  isLoading,
  onSelectConversation,
  onSearch,
  query = '',
}: CounselorInboxConversationListProps) => {
  const filteredConversations = conversations.filter((c) =>
    `${c.userName} ${c.lastMessage}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      {filteredConversations.map((conversation, index) => (
        <motion.button
          key={conversation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 + index * 0.06 }}
          type="button"
          onClick={() => onSelectConversation(conversation.id)}
          className="w-full text-left rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          {/* Accent stripe */}
          <div
            className="h-1 w-full"
            style={{
              background: conversation.unreadForCounselor > 0
                ? 'linear-gradient(90deg, #e8735a, #f0957a)'
                : 'linear-gradient(90deg, #4a90a4, #7bbccc)',
            }}
          />

          <div className="flex items-center gap-3 px-4 py-4">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#eaf3f7' }}
            >
              <UserRound className="h-5 w-5" style={{ color: '#4a90a4' }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold truncate" style={{ color: '#1a2b38' }}>
                  {conversation.userName}
                </p>
                {conversation.unreadForCounselor > 0 && (
                  <span
                    className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{ background: '#e8735a', color: 'white' }}
                  >
                    {conversation.unreadForCounselor}
                  </span>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: '#8fa3b1' }}>
                {conversation.lastMessage || 'New conversation'}
              </p>
            </div>

            <p className="text-[11px] flex-shrink-0" style={{ color: '#b0c0cc' }}>
              {new Date(conversation.lastMessageAt || conversation.updatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </motion.button>
      ))}

      {/* Empty state */}
      {!filteredConversations.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #8fa3b1, #b0c4ce)' }}
          />
          <div className="p-10 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(74,144,164,0.1)' }}
            >
              <MessageSquare className="h-6 w-6" style={{ color: '#4a90a4' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
              {isLoading ? 'Loading chats...' : 'No active chats'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8fa3b1' }}>
              Users who message you will appear here.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CounselorInboxConversationList;
