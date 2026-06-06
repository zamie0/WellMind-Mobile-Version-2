import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Send, ArrowLeft, Video, Info } from 'lucide-react';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { CounselorAvatar, getStatusColor } from './CounselorAvatar';
import { CounselorProfileView } from './CounselorProfileView';
import { formatMessageContent, formatTime } from './CounselorSupportChat.utils';
import type { CounselorChat, CounselorUser } from '@/types/wellmind';
import type { RefObject } from 'react';

interface CounselorChatViewProps {
  embedded?: boolean;
  activeChat: CounselorChat;
  chatCounselor: CounselorUser;
  counselorProfile: CounselorUser | null;
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
  onBack: () => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export const CounselorChatView = ({
  embedded = false,
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

  return (
    <div
    className="min-h-screen flex flex-col"
    style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
  >
    {/* ── Header ──────────────────────────────────────────────── */}
    <header
      className="sticky top-0 z-10 px-5 py-3.5"
      style={{
        background: 'rgba(240,247,245,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(57,168,155,0.15)',
        paddingTop: 'max(env(safe-area-inset-top), 14px)',
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
              style={{ color: chatCounselor.status === 'online' ? '#39a89b' : '#8fa3b1' }}
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
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          aria-label="Video call"
        >
          <Video className="h-4 w-4" style={{ color: '#39a89b' }} />
        </motion.button>
      </div>
    </header>

    {/* ── Messages ────────────────────────────────────────────── */}
    <main className="flex-1 overflow-y-auto px-5 py-5 space-y-3 pb-28">
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
        {activeChat.messages.map((message, index) => {
          const isOwn = message.senderId === counselorProfile?.id;
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[78%] px-4 py-3 rounded-2xl"
                style={
                  isOwn
                    ? {
                        background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                        borderBottomRightRadius: 5,
                        boxShadow: '0 2px 10px rgba(57,168,155,0.25)',
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
                    color: isOwn ? 'rgba(255,255,255,0.65)' : '#8fa3b1',
                    textAlign: isOwn ? 'right' : 'left',
                  }}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </main>

    {/* ── Input Footer ─────────────────────────────────────────── */}
    <footer
      className="sticky px-5 py-3"
      style={{
        bottom: embedded ? 0 : 64,
        background: 'rgba(240,247,245,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '0.5px solid rgba(57,168,155,0.15)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
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

    <AnimatePresence>
      {showProfile && <CounselorProfileView counselor={chatCounselor} onClose={() => setShowProfile(false)} />}
    </AnimatePresence>

    {!embedded && <BottomNav />}
  </div>
  );
};