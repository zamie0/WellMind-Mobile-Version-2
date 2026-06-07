import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ClipboardCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// ── Tone styles ──────────────────────────────────────────────────────────────
const toneStyle = (tone: 'positive' | 'mild' | 'moderate' | 'severe') => {
  switch (tone) {
    case 'positive': return { background: 'rgba(57,168,155,0.12)', color: '#39a89b' };
    case 'mild':     return { background: 'rgba(251,191,36,0.12)', color: '#d97706' };
    case 'moderate': return { background: 'rgba(232,115,90,0.12)', color: '#e8735a' };
    case 'severe':   return { background: 'rgba(239,68,68,0.1)',   color: '#dc2626' };
  }
};

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
      const result: Result = { id: active.id, score, date: new Date().toISOString(), level: interp.level };
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

  // ── Question view ──────────────────────────────────────────────────────────
  if (active && !done) {
    const q = active.questions[step];
    const progress = (step / active.questions.length) * 100;

    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 px-5 py-3.5 shrink-0"
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
              onClick={exit}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              aria-label="Exit assessment"
            >
              <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
            </motion.button>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>{active.title}</p>
              <p className="text-[11px] font-semibold" style={{ color: '#8fa3b1' }}>
                Question {step + 1} of {active.questions.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="mt-3 rounded-full overflow-hidden"
            style={{ height: 4, background: 'rgba(57,168,155,0.12)' }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
            />
          </div>
        </header>

        {/* Question + options */}
        <main className="flex-1 flex flex-col px-5 py-8">
          <AnimatePresence mode="wait">
            <motion.h2
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold leading-snug mb-10"
              style={{ color: '#1a2b38' }}
            >
              {q}
            </motion.h2>
          </AnimatePresence>

          <div className="space-y-3 mt-auto">
            {active.scale.map((opt, i) => (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => answer(opt.value)}
                className="w-full text-left rounded-2xl px-4 py-4 transition-all"
                style={{
                  background: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  border: '1.5px solid transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(57,168,155,0.35)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(57,168,155,0.1)', color: '#39a89b' }}
                  >
                    {opt.value}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#1a2b38' }}>{opt.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ── Result view ────────────────────────────────────────────────────────────
  if (active && done) {
    const score = answers.reduce((a, b) => a + b, 0);
    const interp = active.interpret(score);
    const ts = toneStyle(interp.tone);

    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
      >
        {/* Header */}
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
              onClick={exit}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
            </motion.button>
            <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>Your Result</p>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 space-y-4">
          {/* Hero result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 rounded-3xl"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: ts.background }}
            >
              <CheckCircle2 className="h-10 w-10" style={{ color: ts.color }} />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#1a2b38' }}>{active.title}</h2>

            {/* Score pill */}
            <div className="inline-flex flex-col items-center mt-4 px-8 py-4 rounded-2xl" style={ts}>
              <span className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ opacity: 0.7 }}>Score</span>
              <span className="text-5xl font-bold leading-none">{score}</span>
              <span className="text-base font-semibold mt-1">{interp.level}</span>
            </div>
          </motion.div>

          {/* Advice card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl px-5 py-4"
            style={{ background: 'rgba(57,168,155,0.07)', border: '0.5px solid rgba(57,168,155,0.2)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#8fa3b1' }}>
              What this means
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#1a2b38' }}>{interp.advice}</p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-2.5"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => start(active)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold"
              style={{
                background: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                border: '1.5px solid rgba(57,168,155,0.25)',
                color: '#39a89b',
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Retake Assessment
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={exit}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 4px 14px rgba(57,168,155,0.35)',
              }}
            >
              Back to Assessments
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* Header */}
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
              <ClipboardCheck className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Self Assessments</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>Quick, private wellness check-ins</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero banner */}
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
            How are you{'\n'}really feeling?
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Evidence-based screens — takes less than 2 minutes.
          </p>
        </motion.div>
      </motion.div>

      {/* Assessment cards */}
      <main className="px-5 space-y-3 pb-6">
        {ASSESSMENTS.map((a, i) => {
          const last = history.find((h) => h.id === a.id);
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => start(a)}
              className="w-full text-left rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
              {/* Accent line */}
              <div
                className="h-0.5 w-full"
                style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
              />
              <div className="p-4 flex items-start gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(57,168,155,0.1)' }}
                >
                  <ClipboardCheck className="h-5 w-5" style={{ color: '#39a89b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm mb-0.5" style={{ color: '#1a2b38' }}>{a.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#8fa3b1' }}>{a.description}</p>
                  {last && (
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(57,168,155,0.1)', color: '#39a89b' }}
                      >
                        Last: {last.level} · {last.score} pts
                      </span>
                      <span className="text-[10px]" style={{ color: '#b0c0cc' }}>
                        {new Date(last.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl px-4 py-3.5"
          style={{ background: 'rgba(57,168,155,0.07)', border: '0.5px solid rgba(57,168,155,0.15)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: '#5f7585' }}>
            ⚠️ These are screening tools, not a diagnosis. If you're struggling, please reach out to a counselor or crisis line.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default SelfAssessment;