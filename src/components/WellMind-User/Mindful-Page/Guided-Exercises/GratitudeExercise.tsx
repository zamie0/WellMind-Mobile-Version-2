import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Sunrise, Users, ArrowLeft, ArrowRight, RefreshCcw, Heart } from 'lucide-react';

interface GratitudeExerciseProps {
  onClose: () => void;
}

const ACCENT = '#39a89b';

const prompts = [
  { Icon: Sunrise,  text: 'Something that made you smile today',     sub: 'Big or small, anything counts' },
  { Icon: Users,    text: 'A person you are grateful for',            sub: "Someone who's made a difference" },
  { Icon: Sparkles, text: 'A small thing often taken for granted',    sub: 'Look for the quiet blessings' },
];

export const GratitudeExercise = ({ onClose }: GratitudeExerciseProps) => {
  const [current, setCurrent] = useState(0);
  const [entries, setEntries] = useState(['', '', '']);
  const [complete, setComplete] = useState(false);

  const updateEntry = (val: string) => {
    const next = [...entries];
    next[current] = val;
    setEntries(next);
  };

  const goNext = () => {
    if (current < prompts.length - 1) setCurrent((c) => c + 1);
    else setComplete(true);
  };

  const goBack = () => setCurrent((c) => c - 1);
  const restart = () => { setCurrent(0); setEntries(['', '', '']); setComplete(false); };

  const filled = entries.filter((e) => e.trim().length > 0).length;
  const { Icon, text, sub } = prompts[current];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #e8f5f3 0%, #f4faf9 50%, #ffffff 100%)' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Sunrise className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>Gratitude</p>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#1a2b38' }}>Daily Practice</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(26,43,56,0.07)' }}
        >
          <X className="h-4 w-4" style={{ color: '#1a2b38' }} />
        </motion.button>
      </div>

      {/* ── Round dots ── */}
      <div className="flex justify-center gap-2 mt-2 mb-6">
        {prompts.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === current && !complete ? 20 : 8,
              background: complete || i < current ? ACCENT : i === current ? ACCENT : '#c8dbd7',
              opacity: complete || i < current ? 0.6 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!complete ? (
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              {/* Orb */}
              <div className="relative flex items-center justify-center mb-5" style={{ width: 140, height: 140 }}>
                <div className="absolute rounded-full" style={{ width: 140, height: 140, background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 70%)` }} />
                <div className="absolute rounded-full" style={{ width: 100, height: 100, background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)` }} />
                <div className="absolute rounded-full flex items-center justify-center" style={{ width: 72, height: 72, background: `${ACCENT}28` }}>
                  <Icon className="h-7 w-7" style={{ color: ACCENT }} />
                </div>
              </div>

              <p className="text-[17px] font-bold text-center mb-1.5" style={{ color: '#1a2b38' }}>{text}</p>
              <p className="text-[13px] text-center mb-5" style={{ color: '#5f7585' }}>{sub}</p>

              <textarea
                value={entries[current]}
                onChange={(e) => updateEntry(e.target.value)}
                placeholder="Write your thoughts here…"
                className="w-full h-28 rounded-2xl p-4 text-sm resize-none outline-none"
                style={{
                  border: `1.5px solid ${ACCENT}40`,
                  background: 'rgba(255,255,255,0.85)',
                  color: '#1a2b38',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1, repeat: 2 }}
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-4"
                style={{ background: `${ACCENT}22` }}
              >
                <Sparkles className="h-9 w-9" style={{ color: ACCENT }} />
              </motion.div>

              <p className="text-2xl font-bold mb-1.5" style={{ color: '#1a2b38' }}>Well done ✦</p>
              <p className="text-sm text-center mb-5" style={{ color: '#5f7585' }}>
                You found {filled} thing{filled !== 1 ? 's' : ''} to be grateful for today.
              </p>

              <div className="w-full rounded-2xl p-4 mb-4 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.85)', border: `1.5px solid ${ACCENT}25` }}>
                {entries.map((e, i) => {
                  if (!e.trim()) return null;
                  const { Icon: I } = prompts[i];
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${ACCENT}18` }}>
                        <I className="h-4 w-4" style={{ color: ACCENT }} />
                      </div>
                      <p className="text-sm flex-1 leading-relaxed" style={{ color: '#1a2b38' }}>{e}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#5f7585' }}>
                <Heart className="h-3.5 w-3.5 fill-current" style={{ color: '#e07a5f' }} />
                <span>Gratitude rewires your brain for happiness</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="px-6 pb-16 flex flex-col gap-3">
        {!complete ? (
          <div className="flex items-center gap-3">
            {current > 0 && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={goBack}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(26,43,56,0.06)' }}
              >
                <ArrowLeft className="h-5 w-5" style={{ color: '#5f7585' }} />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: `0 6px 24px ${ACCENT}55` }}
            >
              {current === prompts.length - 1 ? <><Check className="h-5 w-5" /> Complete</> : <>Next <ArrowRight className="h-5 w-5" /></>}
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={restart}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px]"
              style={{ background: 'rgba(26,43,56,0.06)', color: '#1a2b38' }}
            >
              <RefreshCcw className="h-4 w-4" /> Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-[15px] text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: `0 6px 24px ${ACCENT}55` }}
            >
              Done
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};