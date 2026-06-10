import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';
import { Send, ArrowLeft, Video, Phone, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CounselorAvatar, getStatusColor } from './CounselorAvatar';
import { CounselorProfileView } from './CounselorProfileView';
import { formatMessageContent, formatTime } from './CounselorSupportChat.utils';
import { CounselorVideoCall } from '@/components/WellMind-Counselor/Inbox-Page/CounselorVideoCall';
import { useVideoCall } from '@/hooks/useVideoCall';
import { sendChatMessage } from '@/lib/realtimeCounselorChat';
import { useIncomingCallStore } from '@/stores/incomingCallStore';
import type { CounselorChat, CounselorUser } from '@/types/wellmind';
import type { RefObject } from 'react';

interface CounselorChatViewProps {
  embedded?: boolean;
  activeChat: CounselorChat;
  chatCounselor: CounselorUser;
  counselorProfile: CounselorUser | null;
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void | Promise<void>;
  onBack: () => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export const CounselorChatView = ({
  activeChat,
  chatCounselor,
  counselorProfile,
  messageInput,
  setMessageInput,
  handleSendMessage,
  onBack,
  messagesEndRef,
}: CounselorChatViewProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const isOnline = chatCounselor.status === 'online';

  const {
    isActive: isVideoCallActive,
    isMinimized: isVideoCallMinimized,
    localStream: userLocalStream,
    remoteStream: userRemoteStream,
    remoteUserName: userRemoteUserName,
    isAudioEnabled: isUserAudioEnabled,
    isVideoEnabled: isUserVideoEnabled,
    connectionState: userConnectionState,
    startCall: startUserCall,
    endCall: endUserCall,
    toggleMinimize: toggleUserMinimize,
    toggleAudio: toggleUserAudio,
    toggleVideo: toggleUserVideo,
    acceptIncomingCall,
  } = useVideoCall({
    conversationId: activeChat.id,
    localUserId: counselorProfile?.id ?? undefined,
    localUserName: counselorProfile?.displayName ?? 'You',
    localRole: 'user',
    onError: (error) => {
      console.error(error);
    },
  });

  const logUserCallEvent = async (label: string) => {
    if (!activeChat.id || !counselorProfile) return;
    try {
      await sendChatMessage(activeChat.id, {
        senderId: counselorProfile.id,
        senderRole: 'user',
        senderName: counselorProfile.displayName,
        text: label,
      });
    } catch (error) {
      console.error('Failed to save call history:', error);
    }
  };

  const handleStartVideoCall = async () => {
    try {
      await startUserCall(chatCounselor.id, chatCounselor.displayName, 'video');
      await logUserCallEvent(`Started video call with ${chatCounselor.displayName}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Unable to start video call');
    }
  };

  const handleStartAudioCall = async () => {
    try {
      await startUserCall(chatCounselor.id, chatCounselor.displayName, 'audio');
      await logUserCallEvent(`Started audio call with ${chatCounselor.displayName}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Unable to start audio call');
    }
  };

  const handleEndCall = async () => {
    endUserCall();
    await logUserCallEvent(`Ended call with ${chatCounselor.displayName}`);
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

  const visibleMessages = useMemo(
    () => activeChat.messages.slice(Math.max(activeChat.messages.length - 220, 0)),
    [activeChat.messages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messagesEndRef, visibleMessages.length]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const scrollToLatest = () => {
      window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 80);
    };
    viewport.addEventListener('resize', scrollToLatest);
    return () => viewport.removeEventListener('resize', scrollToLatest);
  }, [messagesEndRef]);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      className="fixed inset-0 flex flex-col z-50"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Header ── */}
      <header
        className="flex-shrink-0 px-4 py-3"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
          background: 'rgba(240,247,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.15)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Back */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          {/* Counselor info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <CounselorAvatar counselor={chatCounselor} size="sm" />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${getStatusColor(chatCounselor.status)}`}
                style={{ borderColor: '#f0f7f5' }}
              />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>
                {chatCounselor.displayName}
              </p>
              <p
                className="text-[11px] font-semibold capitalize"
                style={{ color: isOnline ? '#39a89b' : '#8fa3b1' }}
              >
                {chatCounselor.status}
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowProfile(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="View counselor profile"
          >
            <Info className="h-4 w-4" style={{ color: '#39a89b' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleStartAudioCall}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Audio call"
          >
            <Phone className="h-4 w-4" style={{ color: '#39a89b' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleStartVideoCall}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Video call"
          >
            <Video className="h-4 w-4" style={{ color: '#39a89b' }} />
          </motion.button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
        {/* Empty state */}
        {activeChat.messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-3"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(57,168,155,0.1)' }}
            >
              <Send className="h-7 w-7" style={{ color: '#39a89b' }} />
            </div>
            <p className="text-sm text-center leading-relaxed" style={{ color: '#8fa3b1' }}>
              Start the conversation.{'\n'}Share what's on your mind.
            </p>
          </motion.div>
        )}

        {/* Message bubbles */}
        <AnimatePresence>
          {visibleMessages.map((message, index) => {
            const isOwn = message.senderId === counselorProfile?.id;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                index={index}
              />
            );
          })}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </main>

      {/* ── Input Footer ── */}
      <footer
        className="flex-shrink-0 px-5 py-3"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
          background: 'rgba(240,247,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '0.5px solid rgba(57,168,155,0.15)',
        }}
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid rgba(57,168,155,0.15)',
          }}
        >
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
            style={{ color: '#1a2b38' }}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
              boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              opacity: messageInput.trim() ? 1 : 0.45,
            }}
            aria-label="Send message"
          >
            <Send className="h-4 w-4 text-white" />
          </motion.button>
        </div>
      </footer>

      {/* ── Profile modal ── */}
      <AnimatePresence>
        {showProfile && (
          <CounselorProfileView counselor={chatCounselor} onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>

      {/* BottomNav intentionally removed — chat is a full-page experience */}

      <AnimatePresence>
        {isVideoCallActive && (
          <CounselorVideoCall
            remoteUserName={userRemoteUserName || chatCounselor.displayName}
            localStream={userLocalStream}
            remoteStream={userRemoteStream}
            isAudioEnabled={isUserAudioEnabled}
            isVideoEnabled={isUserVideoEnabled}
            connectionState={userConnectionState}
            onHangup={handleEndCall}
            onMinimize={toggleUserMinimize}
            isMinimized={isVideoCallMinimized}
            onToggleAudio={toggleUserAudio}
            onToggleVideo={toggleUserVideo}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MessageBubble = memo(({
  message,
  isOwn,
  index,
}: {
  message: CounselorChat['messages'][number];
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
              background: message.failed ? '#c0502f' : 'linear-gradient(135deg, #39a89b, #6bab9e)',
              borderBottomRightRadius: 5,
              boxShadow: '0 2px 10px rgba(57,168,155,0.25)',
              opacity: message.optimistic ? 0.78 : 1,
            }
          : {
              background: 'white',
              borderBottomLeftRadius: 5,
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            }
      }
    >
      <p className="text-sm leading-relaxed" style={{ color: isOwn ? 'white' : '#1a2b38' }}>
        {formatMessageContent(message.content)}
      </p>
      <p
        className="text-[10px] mt-1"
        style={{
          color: isOwn ? 'rgba(255,255,255,0.7)' : '#8fa3b1',
          textAlign: isOwn ? 'right' : 'left',
        }}
      >
        {message.failed ? 'Failed' : message.optimistic ? 'Sending...' : formatTime(message.timestamp)}
      </p>
    </div>
  </motion.div>
));
