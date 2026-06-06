import { motion } from 'framer-motion';
import { ArrowLeft, HandHeart, MapPin, Clock, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

import {
  Headphones,
  Users,
  PenTool,
  Globe,
} from 'lucide-react';

const opportunities = [
  {
    id: 'listener',
    title: 'Counselor Listener',
    org: 'WellMind Foundation',
    location: 'Remote',
    hours: '2 hrs/week',
    desc: 'Provide a compassionate ear for those who need to talk.',
    icon: Headphones,
    color: 'bg-coral-light',
    textColor: 'text-coral',
    locationColor: 'bg-coral-light text-coral',
  },
  {
    id: 'workshop',
    title: 'Workshop Facilitator',
    org: 'Campus Wellness',
    location: 'Hybrid',
    hours: '4 hrs/month',
    desc: 'Help run mindfulness sessions for students.',
    icon: Users,
    color: 'bg-sage-light',
    textColor: 'text-sage',
    locationColor: 'bg-sage-light text-sage',
  },
  {
    id: 'content',
    title: 'Content Creator',
    org: 'Mind Matters',
    location: 'Remote',
    hours: 'Flexible',
    desc: 'Write articles and stories about mental wellness.',
    icon: PenTool,
    color: 'bg-lavender-light',
    textColor: 'text-lavender',
    locationColor: 'bg-lavender-light text-lavender',
  },
  {
    id: 'outreach',
    title: 'Community Outreach',
    org: 'Hope Network',
    location: 'Local',
    hours: '3 hrs/week',
    desc: 'Connect with underserved communities in your area.',
    icon: Globe,
    color: 'bg-honey-light',
    textColor: 'text-honey',
    locationColor: 'bg-honey-light text-honey',
  },
];

export default function Volunteering() {
  const navigate = useNavigate();
  const { volunteerSignups, toggle } = useCommunityStore();
  const signedCount = volunteerSignups.length;

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
            <h1 className="text-2xl font-bold text-foreground">Volunteering</h1>
            <p className="text-muted-foreground">Give back to your community</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">
        {/* Signed up summary */}
        {signedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center">
              <HandHeart className="h-5 w-5 text-coral" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Signed up for {signedCount} {signedCount === 1 ? 'opportunity' : 'opportunities'}
              </p>
              <p className="text-xs text-muted-foreground">Thank you for giving back 💚</p>
            </div>
          </motion.div>
        )}

        {/* Opportunity Cards */}
        <section className="space-y-3">
          {opportunities.map((o, i) => {
            const signed = volunteerSignups.includes(o.id);
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  {/* Emoji badge */}
                  <div className={`w-12 h-12 rounded-2xl ${o.color} flex items-center justify-center shrink-0`}>
                    <o.icon className="w-5 h-5 text-foreground stroke-[1.5]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-semibold text-foreground text-sm leading-snug">{o.title}</h3>
                      {signed && (
                        <span className="text-[10px] font-medium text-sage bg-sage-light px-2 py-0.5 rounded-full shrink-0">
                          Signed Up
                        </span>
                      )}
                    </div>

                    {/* Org */}
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Building2 className="h-3 w-3 shrink-0" />
                      {o.org}
                    </p>

                    <p className="text-sm text-muted-foreground leading-snug mb-3">{o.desc}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${o.locationColor}`}>
                        <MapPin className="h-2.5 w-2.5" />
                        {o.location}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-muted text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {o.hours}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider + Action */}
                <div className="h-px bg-border mt-4 mb-3" />
                <Button
                  size="sm"
                  variant={signed ? 'outline' : 'sage'}
                  className="w-full rounded-xl"
                  onClick={() => {
                    toggle('volunteerSignups', o.id);
                    toast.success(signed ? `Withdrew from ${o.title}` : `Signed up for ${o.title}!`);
                  }}
                >
                  {signed ? '✓ Signed Up — Withdraw' : 'Sign Up to Volunteer'}
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