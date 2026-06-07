import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Send, Clock, Trash2, PenLine, X, ArrowLeft } from 'lucide-react';
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

const PROMPTS = [
  "I'm grateful for...",
  "Today I felt...",
  "Something that helped me...",
  "I want to let go of...",
];

export const JournalEntry = ({ onClose }: JournalEntryProps) => {
  const [view, setView] = useState<'write' | 'history'>('write');
  const [content, setContent] = useState('');

  const addJournalEntry = useWellMindStore((s) => s.addJournalEntry);
  const journalEntries = useWellMindStore((s) => s.journalEntries);
  const deleteJournalEntry = useWellMindStore((s) => s.deleteJournalEntry);
  const getTodaysMood = useWellMindStore((s) => s.getTodaysMood);

  const todaysMood = getTodaysMood();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please write something first');
      return;
    }
    addJournalEntry(content.trim(), todaysMood?.id, todaysMood?.emotion);
    setContent('');
    toast.success('Journal entry saved! +5 coins', { description: 'Your thoughts are safely stored.' });
  };

  const handleDelete = (id: string) => {
    deleteJournalEntry(id);
    toast.success('Entry deleted');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
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
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              }}
            >
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Journal</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Your safe space to reflect and release
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab toggle ──────────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 py-3"
        style={{
          background: 'rgba(240,247,245,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.1)',
        }}
      >
        <div
          className="flex rounded-2xl p-1"
          style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
        >
          {[
            { id: 'write' as const, label: 'Write', icon: <PenLine className="h-3.5 w-3.5" /> },
            { id: 'history' as const, label: `History (${journalEntries.length})`, icon: <Clock className="h-3.5 w-3.5" /> },
          ].map((tab) => {
            const isActive = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #39a89b, #6bab9e)' : 'transparent',
                  color: isActive ? 'white' : '#8fa3b1',
                  boxShadow: isActive ? '0 2px 8px rgba(57,168,155,0.3)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait">

          {/* ── Write view ── */}
          {view === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4 pb-8"
            >
              {/* Mood link */}
              {todaysMood && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-3xl overflow-hidden"
                  style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                >
                  <div
                    className="h-0.5 w-full"
                    style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
                  />
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: 'rgba(57,168,155,0.1)' }}
                    >
                      {emotionEmojis[todaysMood.emotion]}
                    </div>
                    <div>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                        style={{ color: '#8fa3b1' }}
                      >
                        Linked mood
                      </p>
                      <p className="text-sm font-bold capitalize" style={{ color: '#1a2b38' }}>
                        Feeling {todaysMood.emotion}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick prompts */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: 'linear-gradient(90deg, #7c6fa0, #7c6fa088)' }}
                />
                <div className="px-4 py-4">
                  <p className="text-xs font-semibold mb-3" style={{ color: '#5f7585' }}>Quick prompts</p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPTS.map((prompt) => (
                      <motion.button
                        key={prompt}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setContent((c) => c + (c ? ' ' : '') + prompt)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(57,168,155,0.09)', color: '#3d7a72' }}
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Textarea card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #3b82f688)' }}
                />
                <div className="px-5 pt-4 pb-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Express your thoughts and feelings here..."
                    className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
                    style={{ color: '#1a2b38', minHeight: 180 }}
                  />
                  <div
                    className="h-px w-full my-3"
                    style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px]" style={{ color: '#b0c0cc' }}>
                      {content.length} characters
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={!content.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                        boxShadow: '0 3px 10px rgba(57,168,155,0.35)',
                        opacity: content.trim() ? 1 : 0.45,
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Save Entry
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── History view ── */}
          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3 pb-8"
            >
              {journalEntries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 gap-3 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(57,168,155,0.1)' }}
                  >
                    <BookOpen className="h-7 w-7" style={{ color: '#39a89b' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>No entries yet</p>
                  <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: '#8fa3b1' }}>
                    Start writing to see your journal entries here
                  </p>
                </motion.div>
              ) : (
                journalEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                    className="rounded-3xl overflow-hidden"
                    style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                  >
                    {/* Accent line */}
                    <div
                      className="h-0.5 w-full"
                      style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e88)' }}
                    />

                    <div className="p-4">
                      {/* Entry header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(57,168,155,0.1)' }}
                          >
                            <Clock className="h-3.5 w-3.5" style={{ color: '#39a89b' }} />
                          </div>
                          <span className="text-[11px] font-medium" style={{ color: '#8fa3b1' }}>
                            {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.linkedEmotion && (
                            <span
                              className="text-sm px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(57,168,155,0.08)' }}
                            >
                              {emotionEmojis[entry.linkedEmotion]}
                            </span>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(entry.id)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                            aria-label="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div
                        className="h-px w-full mb-3"
                        style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
                      />

                      {/* Entry content */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#1a2b38' }}>
                        {entry.content}
                      </p>
                    </div>
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