import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { CounselorAvatar, getStatusColor } from './CounselorAvatar';
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
}: CounselorChatViewProps) => (
  <div className="min-h-screen bg-background flex flex-col">
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <CounselorAvatar counselor={chatCounselor} size="sm" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(chatCounselor.status)}`} />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">{chatCounselor.displayName}</h1>
            <p className="text-xs text-muted-foreground capitalize">{chatCounselor.status}</p>
          </div>
        </div>
      </div>
    </header>

    <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-24">
      {activeChat.messages.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-sage-light mx-auto mb-4 flex items-center justify-center">
            <Send className="h-8 w-8 text-sage" />
          </div>
          <p className="text-muted-foreground">Start the conversation. Share what is on your mind.</p>
        </motion.div>
      )}

      <AnimatePresence>
        {activeChat.messages.map((message, index) => {
          const isOwn = message.senderId === counselorProfile?.id;
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isOwn ? 'bg-coral text-white rounded-br-md' : 'bg-sage-light text-foreground rounded-bl-md'
              }`}>
                <p className="text-sm">{formatMessageContent(message.content)}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>{formatTime(message.timestamp)}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </main>

    <footer className="sticky bottom-16 bg-background border-t border-border px-5 py-4">
      <div className="flex gap-3">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-card"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="bg-coral hover:bg-coral/90 text-white">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </footer>

    {!embedded && <BottomNav />}
  </div>
);
