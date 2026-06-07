import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Heart,
  Sparkles,
  PawPrint,
  BarChart3,
  Shield,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface HelpFAQProps {
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  { category: 'Getting Started', question: 'How do I track my mood?', answer: 'Tap on any mood emoji on the home screen to log how you\'re feeling. You can also add notes about what\'s on your mind and select any triggers that might be affecting you.' },
  { category: 'Getting Started', question: 'What are Calm Coins?', answer: 'Calm Coins are your reward for using WellMind! You earn them by checking in with your mood (+10), claiming daily bonuses (+15), completing exercises (+5), unlocking badges (+25), and more. Use them to care for your virtual pet!' },
  { category: 'Getting Started', question: 'How do I use the breathing exercises?', answer: 'Go to the Mindfulness tab and select a breathing exercise. Follow the visual cues to inhale, hold, and exhale. Start with shorter sessions and gradually increase as you get comfortable.' },
  { category: 'Virtual Pet', question: 'How do I take care of my virtual pet?', answer: 'Your pet needs food, play, and rest! Use Calm Coins to feed different foods, play games together, and give baths. Watch their happiness, energy, hunger, and cleanliness bars to keep them thriving.' },
  { category: 'Virtual Pet', question: 'How does my pet level up?', answer: 'Your pet gains experience when you interact with them and when you complete wellness activities. Once they reach enough experience points, they\'ll level up! Higher levels unlock special rewards.' },
  { category: 'Virtual Pet', question: 'Can I customize my pet?', answer: 'Yes! Visit the Pet Shop to purchase different skins and accessories using your Calm Coins. Each customization gives your pet a unique look.' },
  { category: 'Mood Tracking', question: 'What is the Mood Prediction feature?', answer: 'Based on your mood patterns, sleep, and triggers, WellMind predicts how you might feel tomorrow and suggests preventive actions you can take tonight.' },
  { category: 'Mood Tracking', question: 'How are my insights calculated?', answer: 'Your insights are based on patterns in your mood entries over time. We analyze trends, common triggers, time-of-day patterns, and correlations to give you meaningful feedback.' },
  { category: 'Mood Tracking', question: 'What do the different mood colors mean?', answer: 'Each mood has a distinct color: Happy (green), Neutral (gray), Sad (blue), Anxious (purple), Stressed (orange), Exhausted (dark purple), and Numb (muted gray).' },
  { category: 'Weekly Plan', question: 'How is my Weekly Wellness Plan created?', answer: 'Your personalized plan is generated based on your recent mood patterns, identified triggers, and sleep habits. It suggests daily activities tailored to your needs.' },
  { category: 'Weekly Plan', question: 'Can I customize my weekly tasks?', answer: 'Currently, tasks are automatically generated. Complete them to earn Calm Coins and boost your pet\'s experience. New plans are generated weekly based on your latest mood data.' },
  { category: 'Privacy & Security', question: 'Is my data private?', answer: 'Absolutely! All your data is stored locally on your device. We don\'t upload your personal information to any servers. Your mental health journey is completely private.' },
  { category: 'Privacy & Security', question: 'Can I export my data?', answer: 'Yes! Go to Profile > Privacy to export all your data. You\'ll receive a JSON file with your mood entries, journal entries, and settings.' },
  { category: 'Privacy & Security', question: 'What is the PIN for?', answer: 'The optional PIN adds an extra layer of privacy. When enabled, you\'ll need to enter your PIN to access the app.' },
  { category: 'Counselor Support', question: 'What is Counselor Support Chat?', answer: 'Counselor Support connects you with trained supporters who understand mental health challenges. You can chat anonymously or share your name. It\'s a safe space to talk without judgment.' },
  { category: 'Counselor Support', question: 'Are counselor supporters professionals?', answer: 'Counselor supporters are trained volunteers with personal experience in mental health challenges. They\'re here to listen and support, but they\'re not licensed therapists.' },
  { category: 'Troubleshooting', question: 'I lost my streak. Can I recover it?', answer: 'Unfortunately, streaks reset if you miss a day. But don\'t worry — starting fresh is part of the journey. Each day is a new opportunity to build healthy habits.' },
  { category: 'Troubleshooting', question: 'The app feels slow. What can I do?', answer: 'Try closing and reopening the app. If the issue persists, clearing some old data in Privacy settings might help. Your most important data will be preserved.' },
];

const categoryMeta: Record<string, { icon: React.ElementType; accent: string; accentBg: string }> = {
  'Getting Started':    { icon: Sparkles,       accent: '#e8735a', accentBg: 'rgba(232,115,90,0.1)'   },
  'Virtual Pet':        { icon: PawPrint,        accent: '#39a89b', accentBg: 'rgba(57,168,155,0.1)'   },
  'Mood Tracking':      { icon: BarChart3,       accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.1)'   },
  'Weekly Plan':        { icon: Heart,           accent: '#7c6fa0', accentBg: 'rgba(124,111,160,0.1)'  },
  'Privacy & Security': { icon: Shield,          accent: '#d97706', accentBg: 'rgba(251,191,36,0.12)'  },
  'Counselor Support':  { icon: MessageCircle,   accent: '#e8735a', accentBg: 'rgba(232,115,90,0.1)'   },
  'Troubleshooting':    { icon: HelpCircle,      accent: '#8fa3b1', accentBg: 'rgba(143,163,177,0.1)'  },
};

export const HelpFAQ = ({ onClose }: HelpFAQProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(faqs.map((f) => f.category))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = searchQuery
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory ? faq.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <div
      className="min-h-screen pb-28"
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
            onClick={onClose}
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
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Help & FAQ</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Find answers to common questions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero + Search ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-8 pb-6"
      >
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2
            className="text-[1.75rem] font-bold leading-tight mb-1.5"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            How can we{'\n'}help you?
          </h2>
          <p className="text-[14px] leading-relaxed mb-5" style={{ color: '#5f7585' }}>
            Browse categories or search for answers.
          </p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: '#8fa3b1' }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none"
              style={{
                background: 'white',
                color: '#1a2b38',
                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                border: '1px solid rgba(57,168,155,0.15)',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Category chips ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedCategory(null)}
            className="shrink-0 text-[11px] font-bold px-3.5 py-2 rounded-full"
            style={
              selectedCategory === null
                ? {
                    background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                    color: 'white',
                    boxShadow: '0 3px 10px rgba(57,168,155,0.3)',
                  }
                : {
                    background: 'white',
                    color: '#8fa3b1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(143,163,177,0.2)',
                  }
            }
          >
            All
          </motion.button>

          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const Icon = meta.icon;
            const isActive = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory(isActive ? null : cat)}
                className="shrink-0 text-[11px] font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5"
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
                        color: 'white',
                        boxShadow: `0 3px 10px ${meta.accent}33`,
                      }
                    : {
                        background: 'white',
                        color: '#8fa3b1',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(143,163,177,0.2)',
                      }
                }
              >
                <Icon className="h-3 w-3" />
                {cat}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── FAQ Groups ── */}
        {Object.entries(groupedFaqs).map(([category, items], catIndex) => {
          const meta = categoryMeta[category];
          const CategoryIcon = meta.icon;
          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + catIndex * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
            >
              {/* Category header */}
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.accentBg }}
                >
                  <CategoryIcon className="h-4 w-4" style={{ color: meta.accent }} strokeWidth={1.75} />
                </div>
                <h2 className="text-sm font-bold" style={{ color: '#1a2b38' }}>{category}</h2>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: meta.accentBg, color: meta.accent }}
                >
                  {items.length}
                </span>
              </div>

              {/* FAQ items */}
              <div className="space-y-2">
                {items.map((faq, i) => {
                  const isOpen = expandedQuestion === faq.question;
                  return (
                    <motion.div
                      key={faq.question}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      className="rounded-3xl overflow-hidden"
                      style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                    >
                      {/* Accent line */}
                      <div
                        className="h-0.5 w-full"
                        style={{ background: `linear-gradient(90deg, ${meta.accent}, ${meta.accent}88)` }}
                      />

                      {/* Question row */}
                      <button
                        onClick={() => setExpandedQuestion(isOpen ? null : faq.question)}
                        className="w-full px-4 py-4 flex items-center justify-between text-left gap-3"
                      >
                        <span className="text-sm font-bold leading-snug flex-1" style={{ color: '#1a2b38' }}>
                          {faq.question}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: isOpen ? meta.accentBg : 'rgba(143,163,177,0.1)' }}
                        >
                          <ChevronDown
                            className="h-3.5 w-3.5"
                            style={{ color: isOpen ? meta.accent : '#8fa3b1' }}
                          />
                        </motion.div>
                      </button>

                      {/* Answer */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div
                              className="h-px mx-4"
                              style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
                            />
                            <div
                              className="mx-4 mb-4 mt-3 px-4 py-3 rounded-2xl"
                              style={{ background: meta.accentBg }}
                            >
                              <p className="text-xs leading-relaxed" style={{ color: '#5f7585' }}>
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}

        {/* ── Empty state ── */}
        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #8fa3b1, #8fa3b188)' }}
            />
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(143,163,177,0.1)' }}
              >
                <HelpCircle className="h-7 w-7" style={{ color: '#8fa3b1' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>No results found</p>
              <p className="text-xs leading-relaxed" style={{ color: '#8fa3b1' }}>
                Try a different search term or category
              </p>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default HelpFAQ;