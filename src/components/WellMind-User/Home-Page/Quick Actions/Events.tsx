import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users as UsersIcon, Wifi, Sunrise, Brain, MessageCircle, PersonStanding, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

const events: {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  virtual: boolean;
  icon: LucideIcon;
}[] = [
  { id: 'meditation-park', title: 'Sunrise Meditation in the Park', date: 'Sat, Jun 6', time: '7:00 AM', location: 'Central Park', attendees: 42, virtual: false, icon: Sunrise },
  { id: 'webinar-anxiety', title: 'Managing Anxiety Webinar', date: 'Tue, Jun 9', time: '6:00 PM', location: 'Online', attendees: 187, virtual: true, icon: Brain },
  { id: 'support-circle', title: 'Weekly Support Circle', date: 'Thu, Jun 11', time: '7:30 PM', location: 'Community Center', attendees: 28, virtual: false, icon: MessageCircle },
  { id: 'yoga-flow', title: 'Mindful Yoga Flow', date: 'Sat, Jun 13', time: '9:00 AM', location: 'Online', attendees: 95, virtual: true, icon: PersonStanding },
  { id: 'art-therapy', title: 'Art Therapy Workshop', date: 'Sun, Jun 14', time: '2:00 PM', location: 'Creative Studio', attendees: 18, virtual: false, icon: Palette },
];

export default function Events() {
  const navigate = useNavigate();
  const { rsvpEvents, toggle } = useCommunityStore();
  const rsvpCount = rsvpEvents.length;

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
              style={{ background: 'linear-gradient(135deg, #39a89b, #6bab9e)', boxShadow: '0 2px 8px rgba(57,168,155,0.3)' }}
            >
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Events & Meetups</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>Connect in person & online</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-8 pb-6"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-[1.75rem] font-bold leading-tight mb-1.5" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
            Events &{'\n'}meetups.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Show up for yourself — and for others.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── RSVP summary banner ── */}
        {rsvpCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(57,168,155,0.07)', border: '0.5px solid rgba(57,168,155,0.2)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(57,168,155,0.12)' }}
            >
              <Calendar className="h-5 w-5" style={{ color: '#39a89b' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                {rsvpCount} upcoming {rsvpCount === 1 ? 'event' : 'events'} in your calendar
              </p>
              <p className="text-[11px]" style={{ color: '#8fa3b1' }}>You're all signed up — see you there!</p>
            </div>
          </motion.div>
        )}

        {/* ── Event cards ── */}
        <section className="space-y-3">
          {events.map((e, i) => {
            const going = rsvpEvents.includes(e.id);
            const Icon = e.icon;
            const dateShort = e.date.split(',')[1]?.trim() || e.date;

            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-0.5 w-full"
                  style={{
                    background: e.virtual
                      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      : 'linear-gradient(90deg, #39a89b, #6bab9e)',
                  }}
                />

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon + date */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background: e.virtual ? 'rgba(59,130,246,0.1)' : 'rgba(57,168,155,0.1)',
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: e.virtual ? '#3b82f6' : '#39a89b' }} strokeWidth={1.75} />
                      </div>
                      <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: '#8fa3b1' }}>
                        {dateShort}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-sm leading-snug" style={{ color: '#1a2b38' }}>{e.title}</h3>
                        {e.virtual ? (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                            style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
                          >
                            <Wifi className="h-2.5 w-2.5" />
                            Virtual
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'rgba(57,168,155,0.1)', color: '#39a89b' }}
                          >
                            In-Person
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {[
                          { icon: Calendar, text: `${e.date} · ${e.time}` },
                          { icon: MapPin, text: e.location },
                          { icon: UsersIcon, text: `${e.attendees + (going ? 1 : 0)} attending` },
                        ].map(({ icon: InfoIcon, text }) => (
                          <p key={text} className="flex items-center gap-1.5 text-[11px]" style={{ color: '#8fa3b1' }}>
                            <InfoIcon className="h-3 w-3 flex-shrink-0" />
                            {text}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px w-full mb-3"
                    style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
                  />

                  {/* RSVP button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={
                      going
                        ? {
                            background: 'rgba(57,168,155,0.07)',
                            border: '1.5px solid rgba(57,168,155,0.25)',
                            color: '#39a89b',
                          }
                        : {
                            background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                            boxShadow: '0 3px 10px rgba(57,168,155,0.3)',
                            color: 'white',
                          }
                    }
                    onClick={() => {
                      toggle('rsvpEvents', e.id);
                      toast.success(going ? 'RSVP cancelled' : "You're going! 🎉");
                    }}
                  >
                    {going ? '✓ You\'re going' : 'RSVP to this event'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}