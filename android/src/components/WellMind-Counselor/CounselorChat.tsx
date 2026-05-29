import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Phone, Video, X, Clock } from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

interface CounselorChatProps {
  chatId: string;
  onClose: () => void;
  onBack: () => void;
}

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
};

const SARAH_FAKE_CHAT = [
  { role: 'client', content: 'Hi, I’ve been feeling really overwhelmed with studies lately.' },
  { role: 'counselor', content: 'Thank you for sharing that. What has been stressing you the most?' },
  { role: 'client', content: 'I feel like I’m falling behind compared to others.' },
  { role: 'counselor', content: 'That sounds exhausting. Sometimes constant comparison can increase pressure on ourselves. Have you been getting enough rest recently?' },
  { role: 'client', content: 'Not really. I’ve been overthinking a lot.' },
  { role: 'counselor', content: 'I understand. It may help to focus on smaller daily goals and give yourself credit for the effort you’re already making.' },
  { role: 'client', content: 'I think I’ve been too hard on myself.' },
  { role: 'counselor', content: 'Being kinder to yourself is an important step. You don’t have to handle everything perfectly all at once.' },
  { role: 'client', content: 'Thank you for the helpful session today!' },
] as const;

export const CounselorChat = ({ chatId, onClose, onBack }: CounselorChatProps) => {
  const {
    getActiveSessions,
    endSession,
    getClientById,
    updateClient,
  } = useCounselorStore();

  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSessions = getActiveSessions();
  const session = activeSessions.find((s) => s.id === chatId);
  const client = session ? getClientById(session.clientId) : null;

  // Session timer
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setSessionTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [chatId, session]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!session || session.clientName !== 'Sarah Johnson') return;

    const baseTimestamp = Date.now() - 9 * 60 * 1000;
    const seededMessages: ChatMessage[] = SARAH_FAKE_CHAT.map((item, index) => ({
      id: crypto.randomUUID(),
      senderId: item.role === 'counselor' ? session.id : session.clientId,
      senderName: item.role === 'counselor' ? 'You (Counselor)' : session.clientName,
      content: item.content,
      timestamp: new Date(baseTimestamp + index * 60 * 1000),
    }));

    setMessages(seededMessages);
  }, [session?.id, session?.clientId, session?.clientName]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !session) return;

    const newMessage = {
      id: crypto.randomUUID(),
      senderId: session.id,
      senderName: 'You (Counselor)',
      content: messageInput,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Simulate client response after 2 seconds
    setTimeout(() => {
      const clientResponses = [
        'Thank you for listening. I feel better now.',
        'That makes sense. I never thought about it that way.',
        'How do I implement this in my daily life?',
        'I appreciate your support.',
        'Can we discuss this more next session?',
        'This is really helpful.',
      ];

      const clientMessage = {
        id: crypto.randomUUID(),
        senderId: session.clientId,
        senderName: session.clientName,
        content: clientResponses[Math.floor(Math.random() * clientResponses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, clientMessage]);
    }, 2000);
  };

  const handleEndSession = () => {
    if (!session) return;

    if (sessionNotes.trim()) {
      updateClient(session.clientId, {
        notes: (client?.notes || '') + `\n\n[${new Date().toLocaleDateString()}] ${sessionNotes}`,
      });
    }

    endSession(session.id);
    toast.success('Session ended. Notes saved.');
    onClose();
  };

  if (!session || !client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] bg-background text-foreground flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-bold truncate max-w-[38vw] sm:max-w-none">{session.clientName}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {session.type === 'video' ? '📹 Video Session' : '💬 Chat Session'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg">
              <Clock className="w-4 h-4 text-coral/80" />
              <span className="text-sm font-mono">{formatTime(sessionTimer)}</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground"
            >
              <Phone className="w-5 h-5" />
            </Button>
            {session.type === 'video' && (
              <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground">
                <Video className="w-5 h-5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Session Area */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8 space-y-4">
        {session.type === 'video' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-8 h-8 mx-auto text-coral mb-2" />
                    <p className="text-sm font-medium">{session.clientName}</p>
                    <p className="text-xs text-muted-foreground">Client Camera (Mock)</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-8 h-8 mx-auto text-coral mb-2" />
                    <p className="text-sm font-medium">You (Counselor)</p>
                    <p className="text-xs text-muted-foreground">Counselor Camera (Mock)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Secure video session is active. You can use the chat box below for notes/messages during the call.
              </p>
            </div>

            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <p className="text-muted-foreground mb-2">Video session started</p>
                  <p className="text-muted-foreground text-sm">No chat messages yet</p>
                </motion.div>
              )}

              {messages.map((message, index) => {
                const isOwn = message.senderId === session.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                        isOwn
                          ? 'bg-coral/90 text-accent-foreground rounded-br-md'
                          : 'bg-card border border-border text-foreground rounded-bl-md'
                      }`}
                    >
                      {!isOwn && <p className="text-xs font-medium mb-1 text-muted-foreground">{message.senderName}</p>}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground mb-4">Session started</p>
                <p className="text-muted-foreground text-sm">
                  Begin the conversation when you're ready
                </p>
              </motion.div>
            )}

            {messages.map((message, index) => {
              const isOwn = message.senderId === session.id;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                      isOwn
                        ? 'bg-coral/90 text-accent-foreground rounded-br-md'
                        : 'bg-card border border-border text-foreground rounded-bl-md'
                    }`}
                  >
                    {!isOwn && <p className="text-xs font-medium mb-1 text-muted-foreground">{message.senderName}</p>}
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Notes Section (Togglable) */}
      <motion.div
        initial={false}
        animate={{ height: showNotes ? 'auto' : 0, opacity: showNotes ? 1 : 0 }}
        className="overflow-hidden bg-card border-t border-border"
      >
        {showNotes && (
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3">
            <h3 className="font-semibold text-sm">Session Notes</h3>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add clinical notes for this session..."
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-coral outline-none resize-none text-sm"
              rows={3}
            />
          </div>
        )}
      </motion.div>

      {/* Input Area */}
      <footer
        className="bg-background/95 backdrop-blur border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3">
          <div className="flex gap-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={session.type === 'video' ? 'Type an in-call message...' : 'Type your message...'}
              className="flex-1 bg-card border-border focus:border-coral"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              variant="coral"
              className="shadow-soft"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNotes(!showNotes)}
              className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground"
            >
              {showNotes ? 'Hide Notes' : 'Add Notes'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEndSession}
              className="w-full sm:w-auto border-red-600 text-red-400 hover:bg-red-500/10"
            >
              End {session.type === 'video' ? 'Video ' : ''}Session
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CounselorChat;
