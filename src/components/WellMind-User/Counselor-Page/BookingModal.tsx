import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Mail, Smartphone, X, Calendar, MessageCircle, Video, Clock, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCounselorChatStore, type ConsultationType } from '@/stores/counselorChatStore';
import { toast } from 'sonner';
import { CounselorAvatar } from './CounselorAvatar';
import type { CounselorUser } from '@/types/wellmind';

const DEFAULT_REMINDERS = { push: true, email: false, local: true };
type ReminderState = typeof DEFAULT_REMINDERS;

interface BookingModalProps {
  counselor: CounselorUser;
  onClose: () => void;
  onBooked: () => void;
}

const STEPS = ['Type', 'Date & Time', 'Notes'] as const;
type Step = 0 | 1 | 2;

export const BookingModal = ({ counselor, onClose, onBooked }: BookingModalProps) => {
  const { getAvailableSlots, bookSession } = useCounselorChatStore();

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowIso = tomorrowDate.toISOString().split('T')[0];

  const [step, setStep] = useState<Step>(0);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('chat');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState<ReminderState>(DEFAULT_REMINDERS);

  const slots = date ? getAvailableSlots(counselor.id, date) : [];

  const toggleReminder = (key: keyof ReminderState) =>
    setReminders((prev) => ({ ...prev, [key]: !prev[key] }));

  const canAdvance = step === 0 ? true : step === 1 ? !!date && !!slot : true;

  const handleNext = () => {
    if (step < 2) setStep((s) => (s + 1) as Step);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!date || !slot) {
      toast.error('Please select a date and time slot.');
      return;
    }
    try {
      const id = await bookSession(counselor.id, date, slot, consultationType, reminders, notes);
      if (!id) {
        toast.error('That slot is no longer available.');
        return;
      }
      toast.success(`Session requested with ${counselor.displayName}`);
      onBooked();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not request session.');
    }
  };

  const formatDisplayDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })
      : '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #f7faf9 0%, #eef5f3 100%)' }}
      >
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #b8d9d3 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #c8ddd9 0%, transparent 70%)' }} />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            <X className="h-4 w-4 text-stone-500" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <CounselorAvatar counselor={counselor} size="md" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-[15px] leading-tight">{counselor.displayName}</p>
              <p className="text-xs text-stone-400 mt-0.5">{counselor.specialization}</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{
                      background: i < step ? '#6bab9e' : i === step ? '#e8735a' : 'rgba(0,0,0,0.08)',
                      scale: i === step ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    {i < step ? (
                      <Check className="h-3 w-3 text-white" />
                    ) : (
                      <span className="text-[10px] font-bold" style={{ color: i === step ? 'white' : '#aaa' }}>
                        {i + 1}
                      </span>
                    )}
                  </motion.div>
                  <span className="text-[11px] font-medium" style={{ color: i === step ? '#e8735a' : '#bbb' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-6 h-px flex-shrink-0" style={{ background: i < step ? '#6bab9e' : '#ddd' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="relative px-6 pb-6 min-h-[260px]">
          <AnimatePresence mode="wait">

            {/* Step 0: Consultation type */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >
                <p className="text-sm font-semibold text-stone-700 mb-4">How would you like to meet?</p>

                {[
                  {
                    value: 'chat' as ConsultationType,
                    icon: <MessageCircle className="h-5 w-5" />,
                    title: 'Text Chat',
                    desc: 'Message your counselor at your own pace',
                    show: !counselor.consultationMethods || counselor.consultationMethods.includes('chat'),
                  },
                  {
                    value: 'video' as ConsultationType,
                    icon: <Video className="h-5 w-5" />,
                    title: 'Video Call',
                    desc: 'Face-to-face session via secure video',
                    show: !counselor.consultationMethods || counselor.consultationMethods.includes('video'),
                  },
                ]
                  .filter((o) => o.show)
                  .map((option) => {
                    const selected = consultationType === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => setConsultationType(option.value)}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-2xl p-4 text-left flex items-center gap-4 transition-all border-2"
                        style={{
                          background: selected ? 'rgba(232,115,90,0.08)' : 'white',
                          borderColor: selected ? '#e8735a' : 'transparent',
                          boxShadow: selected ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
                        }}
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: selected ? 'rgba(232,115,90,0.15)' : 'rgba(0,0,0,0.05)', color: selected ? '#e8735a' : '#999' }}
                        >
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm" style={{ color: selected ? '#e8735a' : '#374151' }}>{option.title}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{option.desc}</p>
                        </div>
                        {selected && <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#e8735a' }} />}
                      </motion.button>
                    );
                  })}
              </motion.div>
            )}

            {/* Step 1: Date & Time */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <p className="text-sm font-semibold text-stone-700">Pick a date & time</p>

                {/* Date picker */}
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition-colors"
                  style={{ background: 'white', borderColor: date ? '#e8735a' : 'transparent', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
                >
                  <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: date ? '#e8735a' : '#bbb' }} />
                  <input
                    type="date"
                    min={tomorrowIso}
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setSlot(''); }}
                    className="flex-1 bg-transparent text-sm font-medium outline-none"
                    style={{ color: date ? '#374151' : '#bbb', colorScheme: 'light' }}
                  />
                  {date && <span className="text-xs text-stone-400">{formatDisplayDate(date)}</span>}
                </div>

                {/* Time slots */}
                <AnimatePresence>
                  {date && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <Clock className="h-3.5 w-3.5 text-stone-400" />
                        <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Available slots</p>
                      </div>
                      {slots.length === 0 ? (
                        <div className="rounded-2xl bg-white/80 p-4 text-center">
                          <p className="text-sm text-stone-400">No slots available for this date.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((s) => {
                            const selected = slot === s;
                            return (
                              <motion.button
                                key={s}
                                type="button"
                                onClick={() => setSlot(s)}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-xl py-2.5 text-xs font-semibold transition-all border-2"
                                style={{
                                  background: selected ? '#e8735a' : 'white',
                                  color: selected ? 'white' : '#6b7280',
                                  borderColor: selected ? '#e8735a' : 'transparent',
                                  boxShadow: selected ? '0 2px 8px rgba(232,115,90,0.3)' : '0 1px 3px rgba(0,0,0,0.07)',
                                }}
                              >
                                {s}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 2: Notes & Reminders */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {/* Summary pill */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium flex-wrap"
                  style={{ background: 'rgba(232,115,90,0.08)', color: '#e8735a' }}>
                  <span className="flex items-center gap-1.5">
                    {consultationType === 'chat' ? (
                        <>
                        <MessageCircle className="h-3.5 w-3.5" />
                        Text Chat
                        </>
                    ) : (
                        <>
                        <Video className="h-3.5 w-3.5" />
                        Video
                        </>
                    )}
                    </span>
                  <span>·</span>
                  <span>{formatDisplayDate(date)}</span>
                  <span>·</span>
                  <span>{slot}</span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Notes <span className="font-normal normal-case">(optional)</span></p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly share what you'd like support with..."
                    rows={3}
                    className="resize-none text-sm rounded-2xl border-0 shadow-sm"
                    style={{ background: 'white', color: '#374151' }}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Remind me via</p>
                  <div className="flex gap-2">
                    {([
                      ['push', <BellRing className="h-3.5 w-3.5" />, 'Push'] as const,
                      ['email', <Mail className="h-3.5 w-3.5" />, 'Email'] as const,
                      ['local', <Smartphone className="h-3.5 w-3.5" />, 'Local'] as const,
                    ]).map(([key, icon, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleReminder(key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2"
                        style={{
                          background: reminders[key] ? 'rgba(107,171,158,0.12)' : 'white',
                          borderColor: reminders[key] ? '#6bab9e' : 'transparent',
                          color: reminders[key] ? '#4a9185' : '#9ca3af',
                          boxShadow: reminders[key] ? 'none' : '0 1px 3px rgba(0,0,0,0.07)',
                        }}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-3 border-t"
          style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)' }}
        >
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex-1 rounded-xl h-11 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            >
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-xl h-11 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </Button>
          )}

          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance}
            whileTap={{ scale: 0.97 }}
            className="flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{
              background: canAdvance ? 'linear-gradient(135deg, #e8735a 0%, #d45f47 100%)' : '#e5e7eb',
              color: canAdvance ? 'white' : '#9ca3af',
              boxShadow: canAdvance ? '0 4px 14px rgba(232,115,90,0.35)' : 'none',
            }}
          >
            {step < 2 ? (
              <>Next <ChevronRight className="h-4 w-4" /></>
            ) : (
              <>Confirm<Check className="h-4 w-4" /></>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
