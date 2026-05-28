import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Send, Clock, ChevronLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { JournalEntry as JournalEntryType } from '@/types/wellmind';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute inset-0 bg-background flex flex-col"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-lavender" />
            Journal
          </h2>
          <div className="w-10" />
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setView('write')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              view === 'write'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              view === 'history'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            History ({journalEntries.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            {view === 'write' ? (
              <motion.div
                key="write"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Mood Link */}
                {todaysMood && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-sage-light/50 rounded-xl p-3 flex items-center gap-3"
                  >
                    <span className="text-2xl">{emotionEmojis[todaysMood.emotion]}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Linked to your mood</p>
                      <p className="text-sm font-medium text-foreground capitalize">
                        Feeling {todaysMood.emotion}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Journal Prompts */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quick prompts:</p>
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
                        className="text-xs bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Area */}
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Express your thoughts and feelings here... This is your safe space to reflect and release."
                  className="min-h-[200px] resize-none bg-card border-border focus:border-primary"
                />

                {/* Character Count */}
                <p className="text-xs text-muted-foreground text-right">
                  {content.length} characters
                </p>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="w-full"
                  variant="sage"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {journalEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No journal entries yet</p>
                    <p className="text-sm text-muted-foreground/70">
                      Start writing to see your entries here
                    </p>
                  </div>
                ) : (
                  journalEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card rounded-xl p-4 border border-border"
                    >
                      {/* Entry Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.linkedEmotion && (
                            <span className="text-lg">{emotionEmojis[entry.linkedEmotion]}</span>
                          )}
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Entry Content */}
                      <p className="text-foreground text-sm whitespace-pre-wrap">
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
    </motion.div>
  );
};
