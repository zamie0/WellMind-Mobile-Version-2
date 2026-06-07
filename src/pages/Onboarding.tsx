import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Heart, Shield, Sparkles, ArrowRight, Leaf } from 'lucide-react';

const slides = [
  {
    icon: Heart,
    title: 'Welcome to WellMind',
    description:
      'Your safe space for mental wellness. Track your mood, practice mindfulness, and understand your emotional patterns.',
    accent: '#e8735a',
    accentBg: 'rgba(232,115,90,0.1)',
    accentLight: 'rgba(232,115,90,0.06)',
  },
  {
    icon: Shield,
    title: 'Your Privacy Matters',
    description:
      'All your data stays on your device. We never share your personal information. This is your private journey.',
    accent: '#39a89b',
    accentBg: 'rgba(57,168,155,0.1)',
    accentLight: 'rgba(57,168,155,0.06)',
  },
  {
    icon: Sparkles,
    title: 'Small Steps, Big Impact',
    description:
      'Just a few minutes daily can help you build awareness and develop healthy mental habits.',
    accent: '#d97706',
    accentBg: 'rgba(251,191,36,0.12)',
    accentLight: 'rgba(251,191,36,0.06)',
  },
];

export const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const completeOnboarding = useWellMindStore((s) => s.completeOnboarding);

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else setStep(slides.length);
  };

  const handleComplete = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    setError('');
    completeOnboarding(name.trim());
    navigate('/');
  };

  const isNameStep = step === slides.length;
  const current = slides[step] ?? slides[slides.length - 1];

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      <AnimatePresence mode="wait">

        {/* ── Slide steps ── */}
        {!isNameStep && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Illustration area */}
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                minHeight: '52vh',
                background: `radial-gradient(ellipse at 60% 40%, ${current.accentBg} 0%, ${current.accentLight} 50%, transparent 80%)`,
              }}
            >
              {/* Decorative blobs */}
              <div
                className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
                style={{ background: `radial-gradient(circle, ${current.accentBg} 0%, transparent 70%)` }}
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-16 w-56 h-56 rounded-full"
                style={{ background: `radial-gradient(circle, ${current.accentLight} 0%, transparent 70%)` }}
              />

              {/* Icon ring */}
              <motion.div
                key={`icon-${step}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 22 }}
                className="relative z-10 flex flex-col items-center gap-6"
              >
                {/* Outer ring */}
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{
                    background: 'white',
                    boxShadow: `0 20px 60px ${current.accent}22, 0 4px 20px rgba(0,0,0,0.06)`,
                  }}
                >
                  {/* Inner badge */}
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{ background: current.accentBg }}
                  >
                    {(() => {
                      const Icon = current.icon;
                      return <Icon className="h-14 w-14" style={{ color: current.accent }} strokeWidth={1.5} />;
                    })()}
                  </div>
                </div>

                {/* Step counter */}
                <div
                  className="px-4 py-1.5 rounded-full text-[11px] font-bold"
                  style={{ background: current.accentBg, color: current.accent }}
                >
                  {step + 1} of {slides.length}
                </div>
              </motion.div>
            </div>

            {/* Content card */}
            <div className="flex-1 px-5 pt-6 pb-8 flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="rounded-3xl overflow-hidden mb-5"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${current.accent}, ${current.accent}88)` }}
                />
                <div className="px-5 py-5">
                  <h1
                    className="text-[1.5rem] font-bold leading-tight mb-2"
                    style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
                  >
                    {current.title}
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: '#5f7585' }}>
                    {current.description}
                  </p>
                </div>
              </motion.div>

              {/* Progress dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="flex justify-center gap-2 mb-5"
              >
                {slides.map((s, i) => (
                  <motion.div
                    key={i}
                    animate={{ width: i === step ? 24 : 8 }}
                    transition={{ duration: 0.25 }}
                    className="h-2 rounded-full"
                    style={{
                      background: i === step ? current.accent : 'rgba(143,163,177,0.25)',
                    }}
                  />
                ))}
              </motion.div>

              {/* CTA button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${current.accent}, ${current.accent}cc)`,
                  boxShadow: `0 4px 16px ${current.accent}40`,
                }}
              >
                {step === slides.length - 1 ? 'Get Started' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Name step ── */}
        {isNameStep && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Top illustration */}
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                minHeight: '40vh',
                background: 'radial-gradient(ellipse at 60% 40%, rgba(57,168,155,0.12) 0%, rgba(57,168,155,0.04) 50%, transparent 80%)',
              }}
            >
              <div
                className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.1) 0%, transparent 70%)' }}
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-16 w-56 h-56 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.07) 0%, transparent 70%)' }}
              />

              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="relative z-10 flex flex-col items-center gap-4"
              >
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{
                    background: 'white',
                    boxShadow: '0 20px 60px rgba(57,168,155,0.2), 0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(57,168,155,0.1)' }}
                  >
                    <Leaf className="h-14 w-14" style={{ color: '#39a89b' }} strokeWidth={1.5} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pt-6 pb-8 flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl overflow-hidden mb-4"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
                />
                <div className="px-5 py-5">
                  <h1
                    className="text-[1.5rem] font-bold leading-tight mb-1.5"
                    style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
                  >
                    What should we{'\n'}call you?
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: '#5f7585' }}>
                    This helps personalize your experience.
                  </p>
                </div>
              </motion.div>

              {/* Input card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl overflow-hidden mb-4"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: 'linear-gradient(90deg, #7c6fa0, #7c6fa088)' }}
                />
                <div className="px-5 py-4">
                  <input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                    className="w-full bg-transparent border-none outline-none text-center text-lg font-semibold"
                    style={{ color: '#1a2b38' }}
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs text-center mt-2" style={{ color: '#ef4444' }}>{error}</p>
                  )}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleComplete}
                disabled={!name.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                  boxShadow: '0 4px 16px rgba(57,168,155,0.35)',
                  opacity: name.trim() ? 1 : 0.45,
                }}
              >
                Let's Begin
                <Sparkles className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Disclaimer ── */}
      <div className="px-5 pb-6 text-center">
        <p className="text-[11px] leading-relaxed" style={{ color: '#b0c0cc' }}>
          This app is not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;