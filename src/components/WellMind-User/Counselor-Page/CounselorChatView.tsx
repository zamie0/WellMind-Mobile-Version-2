import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Send, ArrowLeft, Video, Phone, Paperclip,
  Image, Camera, FileText, X, File, Download, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { CounselorAvatar, getStatusColor } from './CounselorAvatar';
import { CounselorProfileView } from './CounselorProfileView';
import { formatMessageContent, formatTime } from './CounselorSupportChat.utils';
import { CounselorVideoCall } from '@/components/WellMind-Counselor/Inbox-Page/CounselorVideoCall';
import { useVideoCall } from '@/hooks/useVideoCall';
import { sendChatMessage } from '@/lib/realtimeCounselorChat';
import { useIncomingCallStore } from '@/stores/incomingCallStore';
import type { ChatAttachment, CounselorChat, CounselorUser } from '@/types/wellmind';
import type { RefObject } from 'react';

interface CounselorChatViewProps {
  embedded?: boolean;
  activeChat: CounselorChat;
  chatCounselor: CounselorUser;
  counselorProfile: CounselorUser | null;
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: (attachment?: ChatAttachment) => void | Promise<void>;
  onBack: () => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const ATTACH_OPTIONS = [
  {
    id: 'image',
    label: 'Image',
    icon: Image,
    accent: '#39a89b',
    bg: 'rgba(57,168,155,0.12)',
    accept: 'image/*',
  },
  {
    id: 'camera',
    label: 'Camera',
    icon: Camera,
    accent: '#4a90a4',
    bg: 'rgba(74,144,164,0.12)',
    accept: 'image/*',
    capture: 'environment' as const,
  },
  {
    id: 'file',
    label: 'File',
    icon: FileText,
    accent: '#7c6fa0',
    bg: 'rgba(124,111,160,0.12)',
    accept: '.pdf,.doc,.docx,.txt,.xls,.xlsx',
  },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMime(mime: string) {
  return mime.startsWith('image/');
}

function fallbackMimeType(file: File, attachmentType: 'image' | 'file') {
  if (file.type) return file.type;
  if (attachmentType === 'image') return 'image/jpeg';
  return 'application/octet-stream';
}

function openAttachment(attachment: ChatAttachment) {
  window.open(attachment.base64, '_blank', 'noopener,noreferrer');
}

function downloadAttachment(attachment: ChatAttachment) {
  const link = document.createElement('a');
  link.href = attachment.base64;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
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
  const [showAttach, setShowAttach] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ChatAttachment | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    onError: (error) => toast.error(error.message),
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
      toast.error(error instanceof Error ? error.message : 'Unable to start video call');
    }
  };

  const handleStartAudioCall = async () => {
    try {
      await startUserCall(chatCounselor.id, chatCounselor.displayName, 'audio');
      await logUserCallEvent(`Started audio call with ${chatCounselor.displayName}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start audio call');
    }
  };

  const handleEndCall = async () => {
    endUserCall();
    await logUserCallEvent(`Ended call with ${chatCounselor.displayName}`);
  };

  const { acceptedCall } = useIncomingCallStore();
  useEffect(() => {
    if (acceptedCall && activeChat.id === acceptedCall.conversationId) {
      acceptIncomingCall().catch((error) => {
        console.error('Failed to accept incoming call:', error);
        toast.error('Failed to establish call connection');
      });
    }
  }, [acceptedCall, acceptIncomingCall, activeChat.id]);

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
      window.setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
        80,
      );
    };
    viewport.addEventListener('resize', scrollToLatest);
    return () => viewport.removeEventListener('resize', scrollToLatest);
  }, [messagesEndRef]);

  // Read file → base64 and set as pending attachment
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMb} MB allowed.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingAttachment({
        id: crypto.randomUUID(),
        name: file.name,
        type: isImageMime(file.type) ? 'image' : 'file',
        mimeType: fallbackMimeType(file, type),
        base64: reader.result as string,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowAttach(false);
  };

  const triggerInput = (id: string) => {
    if (id === 'image') imageInputRef.current?.click();
    else if (id === 'camera') cameraInputRef.current?.click();
    else if (id === 'file') fileInputRef.current?.click();
    setShowAttach(false);
  };

  const handleSend = () => {
    if (!messageInput.trim() && !pendingAttachment) return;
    void handleSendMessage(pendingAttachment ?? undefined);
    setPendingAttachment(null);
  };

  const canSend = messageInput.trim().length > 0 || pendingAttachment !== null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      className="fixed inset-0 flex flex-col z-50"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFileSelected(e, 'image')} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => handleFileSelected(e, 'image')} />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" className="hidden"
        onChange={(e) => handleFileSelected(e, 'file')} />

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
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowProfile(true)}
              className="relative flex-shrink-0"
              aria-label="View counselor profile"
            >
              <CounselorAvatar counselor={chatCounselor} size="sm" />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${getStatusColor(chatCounselor.status)}`}
                style={{ borderColor: '#f0f7f5' }}
              />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfile(true)}
              className="min-w-0 text-left"
              aria-label="View counselor profile"
            >
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>
                {chatCounselor.displayName}
              </p>
              <p className="text-[11px] font-semibold capitalize"
                style={{ color: isOnline ? '#39a89b' : '#8fa3b1' }}>
                {chatCounselor.status}
              </p>
            </motion.button>
          </div>

          <motion.button whileTap={{ scale: 0.94 }} onClick={handleStartAudioCall}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} aria-label="Audio call">
            <Phone className="h-4 w-4" style={{ color: '#39a89b' }} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.94 }} onClick={handleStartVideoCall}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} aria-label="Video call">
            <Video className="h-4 w-4" style={{ color: '#39a89b' }} />
          </motion.button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main
        className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
        onClick={() => showAttach && setShowAttach(false)}
      >
        {activeChat.messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(57,168,155,0.1)' }}>
              <Send className="h-7 w-7" style={{ color: '#39a89b' }} />
            </div>
            <p className="text-sm text-center leading-relaxed" style={{ color: '#8fa3b1' }}>
              Start the conversation.{'\n'}Share what's on your mind.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {visibleMessages.map((message, index) => {
            const isOwn = message.senderId === counselorProfile?.id;
            return (
              <MessageBubble key={message.id} message={message} isOwn={isOwn} index={index} />
            );
          })}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </main>

      {/* ── Input Footer ── */}
      <footer
        className="flex-shrink-0 px-5 py-3 relative"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
          background: 'rgba(240,247,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '0.5px solid rgba(57,168,155,0.15)',
        }}
      >
        {/* ── Attachment tray ── */}
        <AnimatePresence>
          {showAttach && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10"
                onClick={() => setShowAttach(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="absolute left-5 right-5 z-20 rounded-3xl overflow-hidden"
                style={{
                  bottom: 'calc(100% + 8px)',
                  background: 'white',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '0.5px solid rgba(57,168,155,0.15)',
                }}
              >
                <div className="h-0.5 w-full"
                  style={{ background: 'linear-gradient(90deg, #39a89b, #39a89b44)' }} />
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '0.5px solid rgba(143,163,177,0.15)' }}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: '#8fa3b1' }}>Attach</span>
                  <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowAttach(false)}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(143,163,177,0.15)' }} aria-label="Close">
                    <X className="h-3.5 w-3.5" style={{ color: '#5f7585' }} />
                  </motion.button>
                </div>
                <div className="p-3 flex gap-3">
                  {ATTACH_OPTIONS.map((opt, i) => {
                    const Icon = opt.icon;
                    return (
                      <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={() => triggerInput(opt.id)}
                        className="flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl"
                        style={{ background: opt.bg }}
                      >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          style={{ background: 'white', boxShadow: `0 2px 8px ${opt.accent}22` }}>
                          <Icon className="h-5 w-5" style={{ color: opt.accent }} strokeWidth={1.75} />
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: opt.accent }}>
                          {opt.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Pending attachment preview ── */}
        <AnimatePresence>
          {pendingAttachment && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 8, height: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="mb-2 overflow-hidden"
            >
              <div
                className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
                style={{
                  background: 'white',
                  border: '1px solid rgba(57,168,155,0.20)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {/* Thumbnail or file icon */}
                {pendingAttachment.type === 'image' ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid rgba(57,168,155,0.15)' }}>
                    <img
                      src={pendingAttachment.base64}
                      alt={pendingAttachment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,111,160,0.10)' }}>
                    <File className="h-5 w-5" style={{ color: '#7c6fa0' }} strokeWidth={1.75} />
                  </div>
                )}

                {/* Name + size */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#1a2b38' }}>
                    {pendingAttachment.name}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#8fa3b1' }}>
                    {formatBytes(pendingAttachment.size)}
                  </p>
                </div>

                {/* Remove */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPendingAttachment(null)}
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(232,115,90,0.12)' }}
                  aria-label="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" style={{ color: '#e8735a' }} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input bar ── */}
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{
            background: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: `1px solid ${pendingAttachment ? 'rgba(57,168,155,0.30)' : 'rgba(57,168,155,0.15)'}`,
          }}
        >
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowAttach((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: showAttach ? '#1a2b38' : 'rgba(143,163,177,0.12)' }}
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4"
              style={{ color: showAttach ? 'white' : '#8fa3b1' }} strokeWidth={1.75} />
          </motion.button>

          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
              if (showAttach) setShowAttach(false);
            }}
            onFocus={() => setShowAttach(false)}
            placeholder={pendingAttachment ? 'Add a caption...' : 'Type your message...'}
            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
            style={{ color: '#1a2b38' }}
          />

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!canSend}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
              boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              opacity: canSend ? 1 : 0.45,
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
      className="max-w-[78%] rounded-2xl overflow-hidden"
      style={
        isOwn
          ? {
              background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
              borderBottomRightRadius: 5,
              boxShadow: message.failed ? '0 2px 10px rgba(192,80,47,0.18)' : '0 2px 10px rgba(57,168,155,0.25)',
              opacity: message.optimistic || message.failed ? 0.78 : 1,
            }
          : {
              background: 'white',
              borderBottomLeftRadius: 5,
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            }
      }
    >
      {/* Attachment rendering */}
      {message.attachment && (
        message.attachment.type === 'image' ? (
          <div>
            <button
              type="button"
              onClick={() => openAttachment(message.attachment!)}
              className="block w-full"
              aria-label={`Open ${message.attachment.name}`}
            >
              <img
                src={message.attachment.base64}
                alt={message.attachment.name}
                className="w-full max-h-52 object-cover"
                style={{ display: 'block' }}
              />
            </button>
            <AttachmentActions attachment={message.attachment} isOwn={isOwn} />
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 px-4 py-3"
            style={{
              background: isOwn ? 'rgba(255,255,255,0.08)' : 'rgba(57,168,155,0.08)',
              borderBottom: isOwn
                ? '1px solid rgba(255,255,255,0.10)'
                : '1px solid rgba(57,168,155,0.14)',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(57,168,155,0.12)' }}
            >
              <File className="h-4 w-4"
                style={{ color: isOwn ? 'rgba(255,255,255,0.9)' : '#39a89b' }} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate"
                style={{ color: isOwn ? 'rgba(255,255,255,0.95)' : '#1a2b38' }}>
                {message.attachment.name}
              </p>
              <p className="text-[10px]"
                style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : '#8fa3b1' }}>
                {formatBytes(message.attachment.size)}
              </p>
            </div>
            <AttachmentIconButton
              label={`Open ${message.attachment.name}`}
              icon="open"
              isOwn={isOwn}
              onClick={() => openAttachment(message.attachment!)}
            />
            <AttachmentIconButton
              label={`Download ${message.attachment.name}`}
              icon="download"
              isOwn={isOwn}
              onClick={() => downloadAttachment(message.attachment!)}
            />
          </div>
        )
      )}

      {/* Text / caption */}
      {(message.content || message.attachment) && (
        <div className="px-4 py-3">
          {message.content && (
            <p className="text-sm leading-relaxed" style={{ color: isOwn ? 'white' : '#1a2b38' }}>
              {formatMessageContent(message.content)}
            </p>
          )}
          <p
            className="text-[10px] mt-1"
            style={{
              color: message.failed ? '#ffe3dc' : isOwn ? 'rgba(255,255,255,0.7)' : '#8fa3b1',
              textAlign: isOwn ? 'right' : 'left',
            }}
          >
            {message.failed ? 'Failed' : message.optimistic ? 'Sending...' : formatTime(message.timestamp)}
          </p>
        </div>
      )}
    </div>
  </motion.div>
));

const AttachmentActions = ({ attachment, isOwn }: { attachment: ChatAttachment; isOwn: boolean }) => (
  <div
    className="flex items-center justify-end gap-2 px-3 py-2"
    style={{
      background: isOwn ? 'rgba(255,255,255,0.08)' : 'rgba(57,168,155,0.08)',
      borderBottom: isOwn ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(57,168,155,0.14)',
    }}
  >
    <AttachmentIconButton
      label={`Open ${attachment.name}`}
      icon="open"
      isOwn={isOwn}
      onClick={() => openAttachment(attachment)}
    />
    <AttachmentIconButton
      label={`Download ${attachment.name}`}
      icon="download"
      isOwn={isOwn}
      onClick={() => downloadAttachment(attachment)}
    />
  </div>
);

const AttachmentIconButton = ({
  label,
  icon,
  isOwn,
  onClick,
}: {
  label: string;
  icon: 'open' | 'download';
  isOwn: boolean;
  onClick: () => void;
}) => {
  const Icon = icon === 'open' ? ExternalLink : Download;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 rounded-full inline-flex items-center justify-center"
      style={{
        background: isOwn ? 'rgba(255,255,255,0.16)' : 'rgba(57,168,155,0.12)',
        color: isOwn ? 'white' : '#39a89b',
      }}
      aria-label={label}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
};
