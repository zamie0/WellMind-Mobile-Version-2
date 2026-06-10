import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useIncomingCallStore } from '@/stores/incomingCallStore';
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
import { CounselorInboxHeader } from './CounselorInboxHeader';
import { CounselorMessageBubble } from './CounselorInboxMessageBubble';
import { CounselorInboxInput } from './CounselorInboxInput';
import { CounselorInboxConversationList } from './CounselorInboxConversationList';
import { CounselorVideoCall } from './CounselorVideoCall';
import { useVideoCall } from '@/hooks/useVideoCall';

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
  // Quick-reply state for inbox (allows replying without opening thread)
  const [quickInput, setQuickInput] = useState('');
  const [quickTargetId, setQuickTargetId] = useState<string | null>(conversations[0]?.id ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const counselorId = currentUser?.id;
  const counselorName = currentUser?.counselorName || currentUser?.email?.split('@')[0] || 'Counselor';
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Video call state
  const {
    isActive: isVideoCallActive,
    isMinimized: isVideoCallMinimized,
    localStream: counselorLocalStream,
    remoteStream: counselorRemoteStream,
    remoteUserId,
    remoteUserName,
    isAudioEnabled: isCounselorAudioEnabled,
    isVideoEnabled: isCounselorVideoEnabled,
    connectionState: counselorConnectionState,
    startCall,
    endCall,
    toggleMinimize,
    toggleAudio: toggleCounselorAudio,
    toggleVideo: toggleCounselorVideo,
    acceptIncomingCall,
  } = useVideoCall({
    conversationId: activeId ?? undefined,
    localUserId: counselorId ?? undefined,
    localUserName: counselorName,
    localRole: 'counselor',
    onError: (error) => toast.error(error.message),
  });

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

  const sendQuickReply = async () => {
    if (!quickTargetId || !counselorId || !quickInput.trim()) return;
    const text = quickInput.trim();
    const optimisticId = `optimistic-${crypto.randomUUID()}`;
    setQuickInput('');

    // optimistic conversation update: add a lightweight lastMessage and updatedAt
    setConversations((current) =>
      current.map((c) => (c.id === quickTargetId ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } : c)),
    );

    try {
      const { message, conversation } = await sendChatMessage(quickTargetId, {
        senderId: counselorId,
        senderRole: 'counselor',
        senderName: counselorName,
        text,
      });
      // update conversation metadata
      setConversations((current) => current.map((c) => (c.id === conversation.id ? conversation : c)));
      toast.success('Message sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Quick reply failed');
    }
  };

  const logCallEvent = async (eventText: string) => {
    if (!activeId || !counselorId || !activeConversation) return;
    try {
      await sendChatMessage(activeId, {
        senderId: counselorId,
        senderRole: 'counselor',
        senderName: counselorName,
        text: eventText,
      });
    } catch (error) {
      console.error('Failed to save call history:', error);
    }
  };

  const handleStartVideoCall = async () => {
    if (!activeConversation) return;
    try {
      await startCall(activeConversation.userId || '', activeConversation.userName, 'video');
      await logCallEvent(`Started video call with ${activeConversation.userName}`);
      toast.success('Initiating video call...');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start video call');
    }
  };

  const handleStartAudioCall = async () => {
    if (!activeConversation) return;
    try {
      await startCall(activeConversation.userId || '', activeConversation.userName, 'audio');
      await logCallEvent(`Started audio call with ${activeConversation.userName}`);
      toast.success('Initiating audio call...');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start audio call');
    }
  };

  const handleHangUp = async () => {
    if (!activeConversation) return;
    endCall();
    await logCallEvent(`Ended call with ${activeConversation.userName}`);
  };

  // Watch for accepted incoming calls and trigger the WebRTC answer
  const { acceptedCall } = useIncomingCallStore();
  useEffect(() => {
    if (acceptedCall) {
      acceptIncomingCall().catch((error) => {
        console.error('Failed to accept incoming call:', error);
        toast.error('Failed to establish call connection');
      });
    }
  }, [acceptedCall, acceptIncomingCall]);

  // Chat thread view
  if (activeConversation) {
    return (
      <>
        <motion.div
          key="counselor-chat"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          className="fixed inset-0 flex flex-col"
          style={{ background: 'linear-gradient(180deg,#eef4f7 0%,#f8fbfc 60%,#ffffff 100%)', zIndex: 90000 }}
        >
          {/* Header */}
          <CounselorInboxHeader
            activeConversation={activeConversation}
            onBack={() => setActiveId(null)}
            onVideoCall={handleStartVideoCall}
            onAudioCall={handleStartAudioCall}
          />

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
                  <Search className="h-6 w-6" style={{ color: '#4a90a4' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                  No messages yet
                </p>
                <p className="text-xs mt-1" style={{ color: '#8fa3b1' }}>
                  Start the conversation below.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Input */}
          <div style={{ position: 'sticky', bottom: 0, zIndex: 99999 }}>
            <CounselorInboxInput
              input={input}
              onInputChange={setInput}
              onSend={sendMessage}
            />
          </div>
        </motion.div>

        {/* Video call overlay */}
        <AnimatePresence>
          {isVideoCallActive && remoteUserId && (
            <CounselorVideoCall
              remoteUserName={remoteUserName}
              localStream={counselorLocalStream}
              remoteStream={counselorRemoteStream}
              isAudioEnabled={isCounselorAudioEnabled}
              isVideoEnabled={isCounselorVideoEnabled}
              connectionState={counselorConnectionState}
              onHangup={handleHangUp}
              onMinimize={toggleMinimize}
              isMinimized={isVideoCallMinimized}
              onToggleAudio={toggleCounselorAudio}
              onToggleVideo={toggleCounselorVideo}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Inbox list view
  return (
    <motion.div
      key="inbox"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5 px-4 pt-6"
      style={{ zIndex: 90000 }}
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
      <CounselorInboxConversationList
        conversations={conversations}
        isLoading={isLoading}
        onSelectConversation={setActiveId}
        onSearch={setQuery}
        query={query}
      />
      {/* Quick-reply footer: send a message without opening the full thread */}
      {conversations.length > 0 && (
        <footer
          className="px-4 sticky bottom-0 bg-transparent"
          style={{ paddingTop: 8, paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          >
            <select
              value={quickTargetId ?? ''}
              onChange={(e) => setQuickTargetId(e.target.value || null)}
              className="text-sm rounded-md px-2 py-1 border-none outline-none bg-transparent flex-shrink-0"
              style={{ color: '#1a2b38', minWidth: 120 }}
            >
              {conversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.userName}
                </option>
              ))}
            </select>

            <input
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendQuickReply();
                }
              }}
              placeholder="Quick reply to selected chat..."
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              style={{ color: '#1a2b38' }}
            />

            <button
              type="button"
              onClick={() => void sendQuickReply()}
              disabled={!quickInput.trim()}
              className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: quickInput.trim() ? 'linear-gradient(135deg,#4a90a4,#7bbccc)' : '#cbd9dc',
                opacity: quickInput.trim() ? 1 : 0.6,
              }}
              aria-label="Send quick reply"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </footer>
      )}
    </motion.div>
  );
};

export default CounselorInbox;