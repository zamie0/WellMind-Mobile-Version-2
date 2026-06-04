import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ClipboardCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { toast } from 'sonner';

type Assessment = {
  id: string;
  title: string;
  description: string;
  questions: string[];
  scale: { label: string; value: number }[];
  interpret: (score: number) => { level: string; tone: 'positive' | 'mild' | 'moderate' | 'severe'; advice: string };
};

const STD_SCALE = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const ASSESSMENTS: Assessment[] = [
  {
    id: 'phq9',
    title: 'Depression Check (PHQ-9)',
    description: '9 questions • ~2 min • Screens for depression symptoms over the last 2 weeks.',
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling/staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself, or that you are a failure',
      'Trouble concentrating on things',
      'Moving/speaking slowly, or being fidgety/restless',
      'Thoughts that you would be better off dead or hurting yourself',
    ],
    scale: STD_SCALE,
    interpret: (s) => {
      if (s <= 4) return { level: 'Minimal', tone: 'positive', advice: 'You seem to be doing well. Keep up your healthy routines.' };
      if (s <= 9) return { level: 'Mild', tone: 'mild', advice: 'A few signs of mild low mood. Try journaling and gentle activity.' };
      if (s <= 14) return { level: 'Moderate', tone: 'moderate', advice: 'Consider talking with a counselor or trusted person.' };
      if (s <= 19) return { level: 'Moderately Severe', tone: 'severe', advice: 'We recommend reaching out to a counselor soon.' };
      return { level: 'Severe', tone: 'severe', advice: 'Please contact a mental health professional or crisis line today.' };
    },
  },
  {
    id: 'gad7',
    title: 'Anxiety Check (GAD-7)',
    description: '7 questions • ~1 min • Screens for anxiety symptoms over the last 2 weeks.',
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen',
    ],
    scale: STD_SCALE,
    interpret: (s) => {
      if (s <= 4) return { level: 'Minimal', tone: 'positive', advice: 'Anxiety appears low. Keep practicing mindfulness.' };
      if (s <= 9) return { level: 'Mild', tone: 'mild', advice: 'Mild anxiety. Try breathing exercises and grounding.' };
      if (s <= 14) return { level: 'Moderate', tone: 'moderate', advice: 'Consider relaxation routines and a check-in with support.' };
      return { level: 'Severe', tone: 'severe', advice: 'High anxiety detected. Please reach out for professional support.' };
    },
  },
  {
    id: 'stress',
    title: 'Stress Check (PSS-4)',
    description: '4 questions • ~1 min • Quick measure of perceived stress this month.',
    questions: [
      'How often have you felt unable to control important things in your life?',
      'How often have you felt confident about handling personal problems? (reverse)',
      'How often have you felt that things were going your way? (reverse)',
      'How often have you felt difficulties were piling up so high you could not overcome them?',
    ],
    scale: [
      { label: 'Never', value: 0 },
      { label: 'Almost never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Fairly often', value: 3 },
      { label: 'Very often', value: 4 },
    ],
    interpret: (s) => {
      if (s <= 5) return { level: 'Low', tone: 'positive', advice: 'Stress is well-managed. Keep balanced habits.' };
      if (s <= 9) return { level: 'Moderate', tone: 'mild', advice: 'Moderate stress. Try short breaks and relaxation games.' };
      return { level: 'High', tone: 'severe', advice: 'High stress. Consider rest, support, and a counselor session.' };
    },
  },
];

type Result = { id: string; score: number; date: string; level: string };

const STORAGE_KEY = 'wellmind-assessments';

const SelfAssessment = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<Result[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const start = (a: Assessment) => {
    setActive(a);
    setAnswers([]);
    setStep(0);
    setDone(false);
  };

  const answer = (val: number) => {
    if (!active) return;
    const next = [...answers, val];
    setAnswers(next);
    if (next.length >= active.questions.length) {
      const score = next.reduce((a, b) => a + b, 0);
      const interp = active.interpret(score);
      const result: Result = {
        id: active.id,
        score,
        date: new Date().toISOString(),
        level: interp.level,
      };
      const updated = [result, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setDone(true);
      toast.success('Assessment completed');
    } else {
      setStep(step + 1);
    }
  };

  const exit = () => {
    setActive(null);
    setAnswers([]);
    setStep(0);
    setDone(false);
  };

  if (active && !done) {
    const q = active.questions[step];
    const progress = ((step) / active.questions.length) * 100;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-5 pt-safe-top py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={exit}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-foreground">{active.title}</h1>
              <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 py-8 flex flex-col">
          <p className="text-sm text-muted-foreground mb-2">Question {step + 1} of {active.questions.length}</p>
          <AnimatePresence mode="wait">
            <motion.h2
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="text-xl font-semibold text-foreground mb-8"
            >
              {q}
            </motion.h2>
          </AnimatePresence>
          <div className="space-y-3 mt-auto">
            {active.scale.map((opt) => (
              <button
                key={opt.value}
                onClick={() => answer(opt.value)}
                className="w-full text-left bg-card hover:bg-muted border border-border rounded-2xl p-4 transition-all"
              >
                <span className="font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (active && done) {
    const score = answers.reduce((a, b) => a + b, 0);
    const interp = active.interpret(score);
    const toneColor =
      interp.tone === 'positive' ? 'bg-sage-light text-sage-dark'
      : interp.tone === 'mild' ? 'bg-honey-light text-honey'
      : interp.tone === 'moderate' ? 'bg-coral-light text-coral'
      : 'bg-destructive/10 text-destructive';
    return (
      <div className="min-h-screen bg-background px-5 pt-safe-top pb-24">
        <div className="pt-4">
          <Button variant="ghost" size="icon" onClick={exit}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
          <div className="inline-flex w-20 h-20 rounded-full bg-sage-light items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-sage" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{active.title}</h1>
          <p className="text-muted-foreground mt-1">Your result</p>
        </motion.div>
        <div className="mt-8 space-y-4">
          <div className={`rounded-2xl p-6 text-center ${toneColor}`}>
            <p className="text-sm font-medium opacity-80">Score</p>
            <p className="text-5xl font-bold my-2">{score}</p>
            <p className="text-lg font-semibold">{interp.level}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 shadow-soft">
            <p className="text-sm text-muted-foreground">{interp.advice}</p>
          </div>
          <Button onClick={() => start(active)} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" /> Retake
          </Button>
          <Button onClick={exit} className="w-full">Back to assessments</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem]">
        <div className="pt-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground">Self Assessments</h1>
            <p className="text-muted-foreground">Quick, private wellness check-ins</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-4">
        {ASSESSMENTS.map((a, i) => {
          const last = history.find((h) => h.id === a.id);
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => start(a)}
              className="w-full bg-card rounded-2xl p-5 shadow-soft text-left hover:shadow-card transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  {last && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last: {last.level} (score {last.score}) · {new Date(last.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}

        <div className="bg-honey-light/50 rounded-2xl p-5 mt-4">
          <p className="text-sm text-foreground">
            ⚠️ These are screening tools, not a diagnosis. If you're struggling, please reach out to a counselor or crisis line.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default SelfAssessment;
