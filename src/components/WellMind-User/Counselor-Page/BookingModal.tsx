import { useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Mail, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export const BookingModal = ({ counselor, onClose, onBooked }: BookingModalProps) => {
  const { getAvailableSlots, bookSession } = useCounselorChatStore();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowIso = tomorrowDate.toISOString().split('T')[0];

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('chat');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState<ReminderState>(DEFAULT_REMINDERS);
  const slots = date ? getAvailableSlots(counselor.id, date) : [];

  const toggleReminder = (key: keyof ReminderState) =>
    setReminders((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = () => {
    if (!date || !slot) {
      toast.error('Please select a date and time slot.');
      return;
    }

    const id = bookSession(counselor.id, date, slot, consultationType, reminders, notes);
    if (!id) {
      toast.error('That slot is no longer available.');
      return;
    }

    toast.success(`Session requested with ${counselor.displayName}`);
    onBooked();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <CounselorAvatar counselor={counselor} size="sm" />
            <div>
              <p className="font-semibold text-foreground text-sm">{counselor.displayName}</p>
              <p className="text-xs text-muted-foreground">{counselor.specialization}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <h3 className="font-semibold text-foreground">Book a Session</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Preferred Date</label>
              <Input
                type="date"
                min={tomorrowIso}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlot('');
                }}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Consultation Type</label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {(!counselor.consultationMethods || counselor.consultationMethods.includes('chat')) && (
                  <option value="chat">Chat</option>
                )}
                {(!counselor.consultationMethods || counselor.consultationMethods.includes('video')) && (
                  <option value="video">Video</option>
                )}
              </select>
            </div>
          </div>

          {date && (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Available Time Slots</label>
              {slots.length === 0 ? (
                <p className="text-xs text-muted-foreground">No slots available for this date.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        slot === s
                          ? 'bg-sage text-white border-sage'
                          : 'bg-background text-foreground border-border hover:border-sage/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Briefly share what you'd like support with..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-2">Reminders</label>
            <div className="flex gap-2">
              {([
                ['push', <BellRing className="h-3 w-3" />, 'Push'] as const,
                ['email', <Mail className="h-3 w-3" />, 'Email'] as const,
                ['local', <Smartphone className="h-3 w-3" />, 'Local'] as const,
              ]).map(([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleReminder(key)}
                  className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                    reminders[key]
                      ? 'bg-sage-light text-sage border-sage/30'
                      : 'bg-background text-muted-foreground border-border'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!date || !slot} className="flex-1 bg-coral hover:bg-coral/90 text-white">
            Confirm Booking
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
