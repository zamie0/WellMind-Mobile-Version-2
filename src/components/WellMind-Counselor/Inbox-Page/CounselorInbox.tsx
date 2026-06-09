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
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const filteredConversations = conversations.filter((c) =>
    `${c.userName} ${c.lastMessage}`.toLowerCase().includes(query.toLowerCase()),
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
    return () => { socket.off('conversation:updated', onConversationUpdated); };
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
        const withoutOptimistic = current.filter(
          (item) => !(item.optimistic && item.text === message.text && item.senderId === message.senderId),
        );
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
      setConversations((current) =>
        current.map((item) => (item.id === conversation.id ? conversation : item)),
      );
    } catch (error) {
      setMessages((current) =>
        current.map((item) => (item.id === optimisticId ? { ...item, failed: true } : item)),
      );
      toast.error(error instanceof Error ? error.message : 'Message could not be sent');
    }
  };

  // ── Chat thread view ──────────────────────────────────────────────
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
        {/* Header */}
        <header
          className="flex items-center gap-3 px-4"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
            paddingBottom: 12,
            background: 'rgba(238,244,247,0.96)',
            borderBottom: '0.5px solid rgba(74,144,164,0.16)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Back to inbox"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </button>

          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#eaf3f7' }}
          >
            <UserRound className="h-5 w-5" style={{ color: '#4a90a4' }} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: '#1a2b38' }}>
              {activeConversation.userName}
            </p>
            <p className="text-[11px] font-semibold" style={{ color: '#4a90a4' }}>Active chat</p>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
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
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(74,144,164,0.1)' }}
              >
                <MessageSquare className="h-6 w-6" style={{ color: '#4a90a4' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>No messages yet</p>
              <p className="text-xs mt-1" style={{ color: '#8fa3b1' }}>Start the conversation below.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <footer
          className="px-4"
          style={{
            paddingTop: 10,
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void sendMessage()}
              placeholder="Reply to client..."
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              style={{ color: '#1a2b38' }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim()}
              className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{
                background: 'linear-gradient(135deg,#4a90a4,#7bbccc)',
                opacity: input.trim() ? 1 : 0.4,
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

  // ── Inbox list view ───────────────────────────────────────────────
  return (
    <motion.div
      key="inbox"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5"
    >
      {/* Hero header */}
      <div className="relative overflow-hidden px-1 pt-2 pb-1">
        <div
          className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,144,164,0.10) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#4a90a4' }}
            >
              <Inbox className="h-3.5 w-3.5 text-white" />
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#4a90a4' }}
            >
              Inbox
            </span>
          </div>
          <h1
            className="text-[1.75rem] font-bold leading-tight mb-1"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Active Chats
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Messages from your clients.
          </p>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="relative"
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
          style={{ color: '#8fa3b1' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users or messages..."
          className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none"
          style={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
            color: '#1a2b38',
          }}
        />
      </motion.div>

      {/* Conversation list */}
      <div className="space-y-3">
        {filteredConversations.map((conversation, index) => (
          <motion.button
            key={conversation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + index * 0.06 }}
            type="button"
            onClick={() => setActiveId(conversation.id)}
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
    </motion.div>
  );
};

// ── Message bubble ────────────────────────────────────────────────────
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
              background: message.failed
                ? '#c0502f'
                : 'linear-gradient(135deg,#4a90a4,#7bbccc)',
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
      <p
        className="text-[10px] mt-1"
        style={{
          color: isOwn ? 'rgba(255,255,255,0.72)' : '#8fa3b1',
          textAlign: isOwn ? 'right' : 'left',
        }}
      >
        {message.failed
          ? 'Failed'
          : message.optimistic
            ? 'Sending...'
            : new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </motion.div>
));

export default CounselorInbox;