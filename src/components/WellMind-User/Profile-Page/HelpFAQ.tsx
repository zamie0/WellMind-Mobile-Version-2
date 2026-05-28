import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown,
  Heart,
  Sparkles,
  Coins,
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
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I track my mood?',
    answer: 'Tap on any mood emoji on the home screen to log how you\'re feeling. You can also add notes about what\'s on your mind and select any triggers that might be affecting you.',
  },
  {
    category: 'Getting Started',
    question: 'What are Calm Coins?',
    answer: 'Calm Coins are your reward for using WellMind! You earn them by checking in with your mood (+10), claiming daily bonuses (+15), completing exercises (+5), unlocking badges (+25), and more. Use them to care for your virtual pet!',
  },
  {
    category: 'Getting Started',
    question: 'How do I use the breathing exercises?',
    answer: 'Go to the Mindfulness tab and select a breathing exercise. Follow the visual cues to inhale, hold, and exhale. Start with shorter sessions and gradually increase as you get comfortable.',
  },
  
  // Virtual Pet
  {
    category: 'Virtual Pet',
    question: 'How do I take care of my virtual pet?',
    answer: 'Your pet needs food, play, and rest! Use Calm Coins to feed different foods, play games together, and give baths. Watch their happiness, energy, hunger, and cleanliness bars to keep them thriving.',
  },
  {
    category: 'Virtual Pet',
    question: 'How does my pet level up?',
    answer: 'Your pet gains experience when you interact with them and when you complete wellness activities. Once they reach enough experience points, they\'ll level up! Higher levels unlock special rewards.',
  },
  {
    category: 'Virtual Pet',
    question: 'Can I customize my pet?',
    answer: 'Yes! Visit the Pet Shop to purchase different skins and accessories using your Calm Coins. Each customization gives your pet a unique look.',
  },

  // Mood Tracking
  {
    category: 'Mood Tracking',
    question: 'What is the Mood Prediction feature?',
    answer: 'Based on your mood patterns, sleep, and triggers, WellMind predicts how you might feel tomorrow and suggests preventive actions you can take tonight. It helps with early emotional self-care.',
  },
  {
    category: 'Mood Tracking',
    question: 'How are my insights calculated?',
    answer: 'Your insights are based on patterns in your mood entries over time. We analyze trends, common triggers, time-of-day patterns, and correlations to give you meaningful feedback about your emotional wellbeing.',
  },
  {
    category: 'Mood Tracking',
    question: 'What do the different mood colors mean?',
    answer: 'Each mood has a distinct color: Happy (green), Neutral (gray), Sad (blue), Anxious (purple), Stressed (orange), Exhausted (dark purple), and Numb (muted gray). This helps you visualize your emotional patterns.',
  },

  // Weekly Plan
  {
    category: 'Weekly Plan',
    question: 'How is my Weekly Wellness Plan created?',
    answer: 'Your personalized plan is generated based on your recent mood patterns, identified triggers, and sleep habits. It suggests daily activities like breathing exercises, journaling prompts, and social activities tailored to your needs.',
  },
  {
    category: 'Weekly Plan',
    question: 'Can I customize my weekly tasks?',
    answer: 'Currently, tasks are automatically generated. Complete them to earn Calm Coins and boost your pet\'s experience. New plans are generated weekly based on your latest mood data.',
  },

  // Privacy & Security
  {
    category: 'Privacy & Security',
    question: 'Is my data private?',
    answer: 'Absolutely! All your data is stored locally on your device. We don\'t upload your personal information to any servers. Your mental health journey is completely private.',
  },
  {
    category: 'Privacy & Security',
    question: 'Can I export my data?',
    answer: 'Yes! Go to Profile > Privacy to export all your data. You\'ll receive a JSON file with your mood entries, journal entries, and settings.',
  },
  {
    category: 'Privacy & Security',
    question: 'What is the PIN for?',
    answer: 'The optional PIN adds an extra layer of privacy. When enabled, you\'ll need to enter your PIN to access the app. This keeps your personal wellness data safe from prying eyes.',
  },

  // Peer Support
  {
    category: 'Peer Support',
    question: 'What is Peer Support Chat?',
    answer: 'Peer Support connects you with trained supporters who understand mental health challenges. You can chat anonymously or share your name. It\'s a safe space to talk without judgment.',
  },
  {
    category: 'Peer Support',
    question: 'Are peer supporters professionals?',
    answer: 'Peer supporters are trained volunteers who have personal experience with mental health challenges. They\'re here to listen and support, but they\'re not licensed therapists. For professional help, please consult a mental health professional.',
  },

  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'I lost my streak. Can I recover it?',
    answer: 'Unfortunately, streaks reset if you miss a day. But don\'t worry! Starting fresh is part of the journey. Each day is a new opportunity to build healthy habits.',
  },
  {
    category: 'Troubleshooting',
    question: 'The app feels slow. What can I do?',
    answer: 'Try closing and reopening the app. If the issue persists, clearing some old data in Privacy settings might help. Your most important data will be preserved.',
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Getting Started': <Sparkles className="h-5 w-5" />,
  'Virtual Pet': <PawPrint className="h-5 w-5" />,
  'Mood Tracking': <BarChart3 className="h-5 w-5" />,
  'Weekly Plan': <Heart className="h-5 w-5" />,
  'Privacy & Security': <Shield className="h-5 w-5" />,
  'Peer Support': <MessageCircle className="h-5 w-5" />,
  'Troubleshooting': <HelpCircle className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  'Getting Started': 'text-coral bg-coral-light',
  'Virtual Pet': 'text-sage bg-sage-light',
  'Mood Tracking': 'text-sky bg-sky-light',
  'Weekly Plan': 'text-lavender bg-lavender-light',
  'Privacy & Security': 'text-honey bg-honey-light',
  'Peer Support': 'text-coral bg-coral-light',
  'Troubleshooting': 'text-muted-foreground bg-muted',
};

export const HelpFAQ = ({ onClose }: HelpFAQProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(faqs.map((faq) => faq.category))];

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Help & FAQ</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="pl-10 bg-card"
          />
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          <Button
            size="sm"
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'bg-sage hover:bg-sage/90 text-white' : ''}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap ${
                selectedCategory === category ? 'bg-sage hover:bg-sage/90 text-white' : ''
              }`}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* FAQ List */}
        {Object.entries(groupedFaqs).map(([category, items], categoryIndex) => (
          <motion.section
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg ${categoryColors[category]} flex items-center justify-center`}>
                {categoryIcons[category]}
              </div>
              <h2 className="font-semibold text-foreground">{category}</h2>
            </div>

            <div className="space-y-2">
              {items.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                  className="bg-card rounded-xl shadow-soft overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedQuestion(
                      expandedQuestion === faq.question ? null : faq.question
                    )}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${
                        expandedQuestion === faq.question ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedQuestion === faq.question && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-muted-foreground">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No results found</p>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </motion.div>
        )}

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-sage/20 to-sage-light/50 rounded-2xl p-6 text-center"
        >
          <MessageCircle className="h-10 w-10 text-sage mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Still Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? We're here to help!
          </p>
          <Button className="bg-sage hover:bg-sage/90 text-white">
            Contact Support
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default HelpFAQ;
