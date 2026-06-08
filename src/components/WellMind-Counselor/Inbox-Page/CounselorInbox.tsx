import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Inbox, MessageSquare, Search, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  getChatSocket,
  identifyChatParticipant,
  joinConversationRoom,
  leaveConversationRoom,
  listConversations,
  listMessages,
  markConversationRead,
  sendChatMessage,
  type ChatConversation,
  type ChatMessage,
} from '@/lib/realtimeCounselorChat';

interface CounselorInboxProps {
  initialConversationId?: string | null;
  onChatOpened?: () => void;
}

export const CounselorInbox = ({ initialConversationId, onChatOpened }: CounselorInboxProps) => {
  const currentUser = useAuthStore((state) => state.getCurrentUser());
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId || null);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const counselorId = currentUser?.id;
  const counselorName = currentUser?.counselorName || currentUser?.email?.split('@')[0] || 'Counselor';
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || null;

  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.userName} ${conversation.lastMessage}`.toLowerCase().includes(query.toLowerCase()),
  );

  const visibleMessages = useMemo(
    () => messages.slice(Math.max(messages.length - 220, 0)),
    [messages],
  );

  useEffect(() => {
    if (initialConversationId) {
      setActiveId(initialConversationId);
      onChatOpened?.();
    }
  }, [initialConversationId, onChatOpened]);

  useEffect(() => {
    if (!counselorId) return;
    identifyChatParticipant('counselor', counselorId);

    const loadInbox = async () => {
      setIsLoading(true);
      try {
        const { conversations } = await listConversations('counselor', counselorId);
        setConversations(conversations);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load inbox');
      } finally {
        setIsLoading(false);
      }
    };

    void loadInbox();

    const socket = getChatSocket();
    const onConversationUpdated = (conversation: ChatConversation) => {
      if (conversation.counselorId !== counselorId) return;
      setConversations((current) => {
        const existing = current.find((item) => item.id === conversation.id);
        const next = existing
          ? current.map((item) => (item.id === conversation.id ? conversation : item))
          : [conversation, ...current];
        return next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    socket.on('conversation:updated', onConversationUpdated);
    return () => {
      socket.off('conversation:updated', onConversationUpdated);
    };
  }, [counselorId]);

  useEffect(() => {
    if (!activeId) return;
    joinConversationRoom(activeId);

    const loadThread = async () => {
      try {
        const { messages } = await listMessages(activeId, 120);
        setMessages(messages);
        await markConversationRead(activeId, 'counselor');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load messages');
      }
    };

    void loadThread();

    const socket = getChatSocket();
    const onMessageNew = (message: ChatMessage) => {
      if (message.conversationId !== activeId) return;
      setMessages((current) => {
        const withoutOptimistic = current.filter((item) => !(item.optimistic && item.text === message.text && item.senderId === message.senderId));
        if (withoutOptimistic.some((item) => item.id === message.id)) return current;
        return [...withoutOptimistic, message];
      });
      void markConversationRead(activeId, 'counselor').catch(() => {});
    };

    socket.on('message:new', onMessageNew);
    return () => {
      socket.off('message:new', onMessageNew);
      leaveConversationRoom(activeId);
    };
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [visibleMessages.length, activeId]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const scrollToLatest = () => {
      window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 80);
    };
    viewport.addEventListener('resize', scrollToLatest);
    return () => viewport.removeEventListener('resize', scrollToLatest);
  }, []);

  const sendMessage = async () => {
    if (!activeId || !counselorId || !input.trim()) return;
    const text = input.trim();
    const optimisticId = `optimistic-${crypto.randomUUID()}`;
    setInput('');
    setMessages((current) => [
      ...current,
      {
        id: optimisticId,
        conversationId: activeId,
        senderId: counselorId,
        senderRole: 'counselor',
        senderName: counselorName,
        text,
        isRead: false,
        createdAt: new Date().toISOString(),
        optimistic: true,
      },
    ]);

    try {
      const { message, conversation } = await sendChatMessage(activeId, {
        senderId: counselorId,
        senderRole: 'counselor',
        senderName: counselorName,
        text,
      });
      setMessages((current) => current.map((item) => (item.id === optimisticId ? message : item)));
      setConversations((current) => current.map((item) => (item.id === conversation.id ? conversation : item)));
    } catch (error) {
      setMessages((current) => current.map((item) => (item.id === optimisticId ? { ...item, failed: true } : item)));
      toast.error(error instanceof Error ? error.message : 'Message could not be sent');
    }
  };

  if (activeConversation) {
    return (
      <motion.div
        key="counselor-chat"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'linear-gradient(180deg,#eef4f7 0%,#f8fbfc 60%,#ffffff 100%)' }}
      >
        <header
          className="flex items-center gap-3 px-4 py-3"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
            background: 'rgba(238,244,247,0.96)',
            borderBottom: '0.5px solid rgba(74,144,164,0.16)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Back to inbox"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </button>
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: '#eaf3f7' }}>
            <UserRound className="h-5 w-5" style={{ color: '#4a90a4' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: '#1a2b38' }}>{activeConversation.userName}</p>
            <p className="text-[11px] font-semibold" style={{ color: '#4a90a4' }}>Active chat</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {visibleMessages.map((message, index) => (
            <CounselorMessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderRole === 'counselor'}
              index={index}
            />
          ))}
          {!visibleMessages.length && (
            <div className="py-16 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-3" style={{ color: '#4a90a4' }} />
              <p className="text-sm" style={{ color: '#8fa3b1' }}>No messages yet.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer
          className="px-5 py-3"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
            background: 'rgba(238,244,247,0.97)',
            borderTop: '0.5px solid rgba(74,144,164,0.16)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && void sendMessage()}
              placeholder="Reply to client..."
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              style={{ color: '#1a2b38' }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim()}
              className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#4a90a4,#7bbccc)',
                opacity: input.trim() ? 1 : 0.45,
              }}
              aria-label="Send reply"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </footer>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="inbox"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5"
    >
      <div className="px-1 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#4a90a4' }}>
            <Inbox className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a90a4' }}>
            Inbox
          </span>
        </div>
        <h1 className="text-[1.75rem] font-bold leading-tight" style={{ color: '#1a2b38' }}>
          Active Chats
        </h1>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#8fa3b1' }} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users or messages..."
          className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', color: '#1a2b38' }}
        />
      </div>

      <div className="space-y-3">
        {filteredConversations.map((conversation, index) => (
          <motion.button
            key={conversation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            type="button"
            onClick={() => setActiveId(conversation.id)}
            className="w-full flex items-center gap-3 text-left rounded-2xl p-4"
            style={{ background: 'white', boxShadow: '0 3px 14px rgba(0,0,0,0.065)' }}
          >
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: '#eaf3f7' }}>
              <UserRound className="h-5 w-5" style={{ color: '#4a90a4' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold truncate" style={{ color: '#1a2b38' }}>{conversation.userName}</p>
                {conversation.unreadForCounselor > 0 && (
                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: '#e8735a', color: 'white' }}>
                    {conversation.unreadForCounselor}
                  </span>
                )}
              </div>
              <p className="text-xs truncate mt-0.5" style={{ color: '#8fa3b1' }}>
                {conversation.lastMessage || 'New conversation'}
              </p>
            </div>
            <p className="text-[11px]" style={{ color: '#b0c0cc' }}>
              {new Date(conversation.lastMessageAt || conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </motion.button>
        ))}

        {!filteredConversations.length && (
          <div className="rounded-2xl p-10 text-center" style={{ background: 'white', boxShadow: '0 3px 14px rgba(0,0,0,0.065)' }}>
            <MessageSquare className="h-8 w-8 mx-auto mb-3" style={{ color: '#4a90a4' }} />
            <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>{isLoading ? 'Loading chats...' : 'No active chats'}</p>
            <p className="text-xs mt-1" style={{ color: '#8fa3b1' }}>Users who message you will appear here.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CounselorMessageBubble = memo(({
  message,
  isOwn,
  index,
}: {
  message: ChatMessage;
  isOwn: boolean;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.01, 0.12) }}
    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className="max-w-[78%] px-4 py-3 rounded-2xl"
      style={
        isOwn
          ? {
              background: message.failed ? '#c0502f' : 'linear-gradient(135deg,#4a90a4,#7bbccc)',
              color: 'white',
              borderBottomRightRadius: 5,
              opacity: message.optimistic ? 0.78 : 1,
            }
          : {
              background: 'white',
              color: '#1a2b38',
              borderBottomLeftRadius: 5,
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            }
      }
    >
      <p className="text-sm leading-relaxed">{message.text}</p>
      <p className="text-[10px] mt-1" style={{ color: isOwn ? 'rgba(255,255,255,0.72)' : '#8fa3b1', textAlign: isOwn ? 'right' : 'left' }}>
        {message.failed ? 'Failed' : message.optimistic ? 'Sending...' : new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </motion.div>
));

export default CounselorInbox;
