import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { BreathingExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/BreathingExercise';
import { GroundingExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/GroundingExercise';
import { SleepMeditation } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/SleepMeditation';
import { BodyScanExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/BodyScanExercise';
import { ProgressiveMuscleRelaxation } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/ProgressiveMuscleRelaxation';
import { LovingKindnessMeditation } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/LovingKindnessMeditation';
import { VisualizationExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/VisualizationExercise';
import { BoxBreathingExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/BoxBreathingExercise';
import { GratitudeExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/GratitudeExercise';
import {
  Wind, Moon, Sun, Leaf, Play, Clock,
  Waves, Heart, Sparkles, Square, PenLine,
} from 'lucide-react';

/* ── Exercise definitions ───────────────────────────────────────── */
const exercises = [
  {
    id: 'breathing',
    icon: Wind,
    title: 'Deep Breathing',
    description: '4-4-6 breathing technique to calm your nervous system',
    duration: '3 min',
    accent: '#39a89b',
  },
  {
    id: 'box-breathing',
    icon: Square,
    title: 'Box Breathing',
    description: '4-4-4-4 technique used by Navy SEALs for calm under pressure',
    duration: '3 min',
    accent: '#39a89b',
  },
  {
    id: 'body-scan',
    icon: Leaf,
    title: 'Body Scan',
    description: 'Release tension by focusing on each part of your body',
    duration: '5 min',
    accent: '#6bab9e',
  },
  {
    id: 'progressive-muscle',
    icon: Waves,
    title: 'Progressive Muscle Relaxation',
    description: 'Tense and release muscle groups to melt away stress',
    duration: '5 min',
    accent: '#e8735a',
  },
  {
    id: 'grounding',
    icon: Sun,
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to ground yourself in the present',
    duration: '2 min',
    accent: '#f59e0b',
  },
  {
    id: 'sleep',
    icon: Moon,
    title: 'Sleep Meditation',
    description: 'Gentle guidance to help you drift into peaceful sleep',
    duration: '3 min',
    accent: '#8fa3b1',
  },
  {
    id: 'loving-kindness',
    icon: Heart,
    title: 'Loving-Kindness',
    description: 'Send compassion to yourself and others for inner peace',
    duration: '4 min',
    accent: '#e8735a',
  },
  {
    id: 'visualization',
    icon: Sparkles,
    title: 'Peaceful Visualization',
    description: 'Journey to a calming beach scene in your mind',
    duration: '3 min',
    accent: '#39a89b',
  },
  {
    id: 'gratitude',
    icon: PenLine,
    title: 'Gratitude Practice',
    description: 'Reflect on three things you are grateful for today',
    duration: '3 min',
    accent: '#f59e0b',
  },
];

/* ── Helpers ────────────────────────────────────────────────────── */
const SectionHeading = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3 px-0.5">
    {icon}
    <h2 className="text-base font-bold" style={{ color: '#1a2b38', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  </div>
);

/* ── Page ───────────────────────────────────────────────────────── */
export const Mindfulness = () => {
  const [showBreathing, setShowBreathing] = useState(false);
  const [showBoxBreathing, setShowBoxBreathing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showSleepMeditation, setShowSleepMeditation] = useState(false);
  const [showBodyScan, setShowBodyScan] = useState(false);
  const [showProgressiveMuscle, setShowProgressiveMuscle] = useState(false);
  const [showLovingKindness, setShowLovingKindness] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);

  const handleExerciseClick = (id: string) => {
    const map: Record<string, () => void> = {
      'breathing':          () => setShowBreathing(true),
      'box-breathing':      () => setShowBoxBreathing(true),
      'grounding':          () => setShowGrounding(true),
      'sleep':              () => setShowSleepMeditation(true),
      'body-scan':          () => setShowBodyScan(true),
      'progressive-muscle': () => setShowProgressiveMuscle(true),
      'loving-kindness':    () => setShowLovingKindness(true),
      'visualization':      () => setShowVisualization(true),
      'gratitude':          () => setShowGratitude(true),
    };
    map[id]?.();
  };

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-10 pb-8"
      >
        {/* Background rings */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-10 -left-16 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,115,90,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
              <Wind className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Mindfulness
            </span>
          </div>

          <h1 className="text-[2rem] font-bold leading-tight mb-2" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
            Your Calm Space
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: '#5f7585' }}>
            Take a moment for yourself, breathe, and return to the present.
          </p>
        </motion.div>
      </motion.div>

      {/* ── Exercise List ──────────────────────────────────────── */}
      <main className="px-5 space-y-6">
        <div>
          <SectionHeading icon={<Play className="h-4 w-4" style={{ color: '#39a89b' }} />}>
            Guided Exercises
          </SectionHeading>

          <div className="space-y-3">
            {exercises.map((ex, index) => {
              const Icon = ex.icon;
              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="rounded-3xl overflow-hidden"
                  style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                >
                  {/* Accent line */}
                  <div
                    className="h-1 w-full"
                    style={{ background: `linear-gradient(90deg, ${ex.accent}, ${ex.accent}99)` }}
                  />
                  <div className="flex items-start gap-4 px-5 py-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ex.accent}18` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: ex.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm mb-1" style={{ color: '#1a2b38' }}>{ex.title}</p>
                      <p className="text-xs mb-3 leading-relaxed" style={{ color: '#5f7585' }}>{ex.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" style={{ color: '#8fa3b1' }} />
                          <span className="text-xs font-medium" style={{ color: '#8fa3b1' }}>{ex.duration}</span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleExerciseClick(ex.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${ex.accent}, ${ex.accent}cc)`,
                            color: 'white',
                            boxShadow: `0 2px 8px ${ex.accent}40`,
                          }}
                        >
                          <Play className="h-3 w-3" />
                          Start
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div/>
      </main>

      <BottomNav />

      {/* ── Modals ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBreathing        && <BreathingExercise           onClose={() => setShowBreathing(false)} />}
        {showBoxBreathing     && <BoxBreathingExercise        onClose={() => setShowBoxBreathing(false)} />}
        {showGrounding        && <GroundingExercise           onClose={() => setShowGrounding(false)} />}
        {showSleepMeditation  && <SleepMeditation             onClose={() => setShowSleepMeditation(false)} />}
        {showBodyScan         && <BodyScanExercise            onClose={() => setShowBodyScan(false)} />}
        {showProgressiveMuscle && <ProgressiveMuscleRelaxation onClose={() => setShowProgressiveMuscle(false)} />}
        {showLovingKindness   && <LovingKindnessMeditation    onClose={() => setShowLovingKindness(false)} />}
        {showVisualization    && <VisualizationExercise       onClose={() => setShowVisualization(false)} />}
        {showGratitude        && <GratitudeExercise           onClose={() => setShowGratitude(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Mindfulness;