import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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

const categoryMeta: Record<string, { icon: React.ReactNode; color: string; iconColor: string }> = {
  'Getting Started':    { icon: <Sparkles className="h-4 w-4" />,      color: 'bg-coral-light',    iconColor: 'text-coral' },
  'Virtual Pet':        { icon: <PawPrint className="h-4 w-4" />,       color: 'bg-sage-light',     iconColor: 'text-sage' },
  'Mood Tracking':      { icon: <BarChart3 className="h-4 w-4" />,      color: 'bg-sky-light',      iconColor: 'text-sky' },
  'Weekly Plan':        { icon: <Heart className="h-4 w-4" />,          color: 'bg-lavender-light', iconColor: 'text-lavender' },
  'Privacy & Security': { icon: <Shield className="h-4 w-4" />,         color: 'bg-honey-light',    iconColor: 'text-honey' },
  'Counselor Support':  { icon: <MessageCircle className="h-4 w-4" />,  color: 'bg-coral-light',    iconColor: 'text-coral' },
  'Troubleshooting':    { icon: <HelpCircle className="h-4 w-4" />,     color: 'bg-muted',          iconColor: 'text-muted-foreground' },
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
    <div className="min-h-screen bg-background pb-10">

      {/* Header — WellMind pattern */}
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem]">
        <div className="pt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="mb-2 -ml-2 text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground">Help & FAQ</h1>
            <p className="text-muted-foreground">Find answers to common questions</p>
          </motion.div>

          {/* Search bar inside header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3 bg-card/80 backdrop-blur-sm rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-soft"
            />
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 text-xs font-medium px-3.5 py-2 rounded-full transition-all ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card shadow-soft text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? null : cat)}
                className={`shrink-0 text-xs font-medium px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card shadow-soft text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <span className={isActive ? 'text-primary-foreground' : meta.iconColor}>
                  {meta.icon}
                </span>
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* FAQ Groups */}
        {Object.entries(groupedFaqs).map(([category, items], catIndex) => {
          const meta = categoryMeta[category];
          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.08 }}
            >
              {/* Category header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-xl ${meta.color} ${meta.iconColor} flex items-center justify-center`}>
                  {meta.icon}
                </div>
                <h2 className="font-semibold text-foreground text-sm">{category}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              {/* FAQ items */}
              <div className="bg-card rounded-2xl shadow-soft overflow-hidden divide-y divide-border">
                {items.map((faq) => {
                  const isOpen = expandedQuestion === faq.question;
                  return (
                    <div key={faq.question}>
                      <button
                        onClick={() => setExpandedQuestion(isOpen ? null : faq.question)}
                        className="w-full px-4 py-4 flex items-center justify-between text-left gap-3 hover:bg-muted/40 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground leading-snug">{faq.question}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="shrink-0"
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className={`mx-4 mb-4 mt-1 p-3 rounded-xl ${meta.color}`}>
                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}

        {/* Empty state */}
        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-10 shadow-soft text-center"
          >
            <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-medium text-foreground">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term or category</p>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default HelpFAQ;