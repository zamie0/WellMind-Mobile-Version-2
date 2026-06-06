import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users as UsersIcon, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

import {
  Sunrise,
  Brain,
  MessageCircle,
  PersonStanding,
  Palette,
} from 'lucide-react';

const events = [
  {
    id: 'meditation-park',
    title: 'Sunrise Meditation in the Park',
    date: 'Sat, Jun 6',
    time: '7:00 AM',
    location: 'Central Park',
    attendees: 42,
    virtual: false,
    icon: Sunrise,
  },
  {
    id: 'webinar-anxiety',
    title: 'Managing Anxiety Webinar',
    date: 'Tue, Jun 9',
    time: '6:00 PM',
    location: 'Online',
    attendees: 187,
    virtual: true,
    icon: Brain,
  },
  {
    id: 'support-circle',
    title: 'Weekly Support Circle',
    date: 'Thu, Jun 11',
    time: '7:30 PM',
    location: 'Community Center',
    attendees: 28,
    virtual: false,
    icon: MessageCircle,
  },
  {
    id: 'yoga-flow',
    title: 'Mindful Yoga Flow',
    date: 'Sat, Jun 13',
    time: '9:00 AM',
    location: 'Online',
    attendees: 95,
    virtual: true,
    icon: PersonStanding,
  },
  {
    id: 'art-therapy',
    title: 'Art Therapy Workshop',
    date: 'Sun, Jun 14',
    time: '2:00 PM',
    location: 'Creative Studio',
    attendees: 18,
    virtual: false,
    icon: Palette,
  },
];

export default function Events() {
  const navigate = useNavigate();
  const { rsvpEvents, toggle } = useCommunityStore();
  const rsvpCount = rsvpEvents.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem]">
        <div className="pt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-2 -ml-2 text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground">Events & Meetups</h1>
            <p className="text-muted-foreground">Connect in person & online</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">
        {/* RSVP summary */}
        {rsvpCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-honey-light flex items-center justify-center">
              <Calendar className="h-5 w-5 text-honey" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {rsvpCount} upcoming {rsvpCount === 1 ? 'event' : 'events'} in your calendar
              </p>
              <p className="text-xs text-muted-foreground">You're all signed up — see you there!</p>
            </div>
          </motion.div>
        )}

        {/* Event Cards */}
        <section className="space-y-3">
          {events.map((e, i) => {
            const going = rsvpEvents.includes(e.id);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  {/* Emoji + date badge */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-lavender-light flex items-center justify-center">
                      <e.icon className="w-5 h-5 text-foreground stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                      {e.date.split(',')[1]?.trim() || e.date}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm leading-snug">{e.title}</h3>
                      {e.virtual ? (
                        <span className="text-[10px] font-medium text-sky bg-sky-light px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Wifi className="h-2.5 w-2.5" />
                          Virtual
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-sage bg-sage-light px-2 py-0.5 rounded-full shrink-0">
                          In-Person
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {e.date} · {e.time}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {e.location}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UsersIcon className="h-3 w-3 shrink-0" />
                        {e.attendees + (going ? 1 : 0)} attending
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider + Action */}
                <div className="h-px bg-border mt-4 mb-3" />
                <Button
                  size="sm"
                  variant={going ? 'outline' : 'sage'}
                  className="w-full rounded-xl"
                  onClick={() => {
                    toggle('rsvpEvents', e.id);
                    toast.success(going ? 'RSVP cancelled' : "You're going! 🎉");
                  }}
                >
                  {going ? "✓ You're going" : 'RSVP to this event'}
                </Button>
              </motion.div>
            );
          })}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}