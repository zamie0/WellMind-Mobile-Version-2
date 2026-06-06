import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Send, Clock, Trash2, PenLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface JournalEntryProps {
  onClose: () => void;
}

const emotionEmojis: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  stressed: '😤',
  exhausted: '😩',
  numb: '😶',
};

export const JournalEntry = ({ onClose }: JournalEntryProps) => {
  const [view, setView] = useState<'write' | 'history'>('write');
  const [content, setContent] = useState('');

  const addJournalEntry = useWellMindStore((state) => state.addJournalEntry);
  const journalEntries = useWellMindStore((state) => state.journalEntries);
  const deleteJournalEntry = useWellMindStore((state) => state.deleteJournalEntry);
  const getTodaysMood = useWellMindStore((state) => state.getTodaysMood);

  const todaysMood = getTodaysMood();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please write something first');
      return;
    }
    addJournalEntry(content.trim(), todaysMood?.id, todaysMood?.emotion);
    setContent('');
    toast.success('Journal entry saved! +5 coins', {
      description: 'Your thoughts are safely stored.',
    });
  };

  const handleDelete = (id: string) => {
    deleteJournalEntry(id);
    toast.success('Entry deleted');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-auto"
    >
      {/* Header */}
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem] shrink-0">
        <div className="pt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="mb-2 -ml-2 text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Journal
            </h1>
            <p className="text-muted-foreground">
              Your safe space to reflect and release
            </p>
          </motion.div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 px-5 py-6 space-y-5">
        {/* Tab Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-1 shadow-soft flex"
        >
          <button
            onClick={() => setView('write')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              view === 'write'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PenLine className="h-4 w-4 inline mr-1.5" />
            Write
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              view === 'history'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-1.5" />
            History ({journalEntries.length})
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'write' ? (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Mood Link */}
              {todaysMood && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3"
                >
                  <span className="text-3xl">{emotionEmojis[todaysMood.emotion]}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Linked to your mood</p>
                    <p className="text-sm font-medium text-foreground capitalize">
                      Feeling {todaysMood.emotion}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Prompts */}
              <div className="bg-card rounded-2xl p-4 shadow-soft space-y-3">
                <p className="text-sm font-medium text-foreground">Quick prompts</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "I'm grateful for...",
                    "Today I felt...",
                    "Something that helped me...",
                    "I want to let go of...",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setContent(content + (content ? ' ' : '') + prompt)}
                      className="text-xs bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="bg-card rounded-2xl p-4 shadow-soft space-y-3">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Express your thoughts and feelings here..."
                  className="min-h-[180px] resize-none border-none shadow-none outline-none bg-transparent pl-1 pt-1 pr-0 pb-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{content.length} characters</p>
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    size="sm"
                    variant="sage"
                    className="rounded-xl gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Save Entry
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {journalEntries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-10 shadow-soft text-center"
                >
                  <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-medium text-foreground">No entries yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start writing to see your entries here
                  </p>
                </motion.div>
              ) : (
                journalEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl p-4 shadow-soft"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.linkedEmotion && (
                          <span className="text-lg">{emotionEmojis[entry.linkedEmotion]}</span>
                        )}
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-px bg-border mb-3" />
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};