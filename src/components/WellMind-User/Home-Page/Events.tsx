import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const events = [
  { id: 'meditation-park', title: 'Sunrise Meditation in the Park', date: 'Sat, Jun 6 · 7:00 AM', location: 'Central Park', attendees: 42, virtual: false },
  { id: 'webinar-anxiety', title: 'Managing Anxiety Webinar', date: 'Tue, Jun 9 · 6:00 PM', location: 'Online', attendees: 187, virtual: true },
  { id: 'support-circle', title: 'Weekly Support Circle', date: 'Thu, Jun 11 · 7:30 PM', location: 'Community Center', attendees: 28, virtual: false },
  { id: 'yoga-flow', title: 'Mindful Yoga Flow', date: 'Sat, Jun 13 · 9:00 AM', location: 'Online', attendees: 95, virtual: true },
  { id: 'art-therapy', title: 'Art Therapy Workshop', date: 'Sun, Jun 14 · 2:00 PM', location: 'Creative Studio', attendees: 18, virtual: false },
];

export default function Events() {
  const navigate = useNavigate();
  const { rsvpEvents, toggle } = useCommunityStore();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-sage pt-safe-top">
        <div className="px-5 pt-6 pb-8">
          <button onClick={() => navigate('/')} className="mb-4 p-2 -ml-2 rounded-lg hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Events & Meetups</h1>
              <p className="text-sm text-foreground/70">Connect in person & online</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-3">
        {events.map((e, i) => {
          const going = rsvpEvents.includes(e.id);
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-soft border border-border"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-foreground flex-1">{e.title}</h3>
                {e.virtual && (
                  <span className="text-xs font-medium text-sky bg-sky-light px-2 py-1 rounded-full">Virtual</span>
                )}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />{e.date}</p>
                <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</p>
                <p className="flex items-center gap-1"><UsersIcon className="h-3 w-3" />{e.attendees + (going ? 1 : 0)} attending</p>
              </div>
              <Button
                size="sm"
                variant={going ? 'outline' : 'sage'}
                className="w-full"
                onClick={() => {
                  toggle('rsvpEvents', e.id);
                  toast.success(going ? `Cancelled RSVP` : `You're going! 🎉`);
                }}
              >
                {going ? "You're going ✓" : 'RSVP'}
              </Button>
            </motion.div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
