import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Calendar, Users, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

import {
  Wind,
  Heart,
  Moon,
  Target,
} from 'lucide-react';

const programs = [
  {
    id: '7day-calm',
    title: '7-Day Calm Challenge',
    duration: '7 days',
    participants: 1245,
    desc: 'Daily breathing & mindfulness for one week.',
    reward: '70 Calm Coins',
    icon: Wind,
    color: 'bg-sky-light',
    textColor: 'text-sky',
  },
  {
    id: '21-gratitude',
    title: '21 Days of Gratitude',
    duration: '21 days',
    participants: 893,
    desc: 'Build a gratitude habit that lasts.',
    icon: Heart,
    color: 'bg-honey-light',
    textColor: 'text-honey',
    reward: '210 Calm Coins',
  },
  {
    id: 'sleep-reset',
    title: 'Sleep Reset Program',
    duration: '14 days',
    participants: 567,
    desc: 'Reset your sleep cycle with guided practices.',
    icon: Moon,
    color: 'bg-lavender-light',
    textColor: 'text-lavender',
    reward: '140 Calm Coins',
  },
  {
    id: 'mood-master',
    title: 'Mood Mastery',
    duration: '30 days',
    participants: 432,
    desc: 'Track and understand your emotional patterns.',
    icon: Target,
    color: 'bg-coral-light',
    textColor: 'text-coral',
    reward: '300 Calm Coins',
  },
];

export default function Programs() {
  const navigate = useNavigate();
  const { enrolledPrograms, toggle } = useCommunityStore();
  const enrolledCount = enrolledPrograms.length;

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
            <h1 className="text-2xl font-bold text-foreground">Programs & Challenges</h1>
            <p className="text-muted-foreground">Build healthy habits together</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">
        {/* Enrolled summary */}
        {enrolledCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-honey-light flex items-center justify-center">
              <Trophy className="h-5 w-5 text-honey" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Active in {enrolledCount} {enrolledCount === 1 ? 'challenge' : 'challenges'}
              </p>
              <p className="text-xs text-muted-foreground">Keep going — you're building great habits!</p>
            </div>
          </motion.div>
        )}

        {/* Program Cards */}
        <section className="space-y-3">
          {programs.map((p, i) => {
            const enrolled = enrolledPrograms.includes(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  {/* Emoji badge */}
                  <div className={`w-12 h-12 rounded-2xl ${p.color} flex items-center justify-center shrink-0`}>
                    <p.icon className="w-5 h-5 text-foreground stroke-[1.5]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm leading-snug">{p.title}</h3>
                      {enrolled && (
                        <span className="text-[10px] font-medium text-sage bg-sage-light px-2 py-0.5 rounded-full shrink-0">
                          Enrolled
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {p.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {p.participants.toLocaleString()} joined
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-snug mb-3">{p.desc}</p>

                    {/* Reward pill */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-coral bg-coral-light px-2.5 py-1 rounded-full">
                      🪙 {p.reward}
                    </span>
                  </div>
                </div>

                {/* Progress bar (enrolled) */}
                {enrolled && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Your progress</span>
                      <span className="font-medium text-foreground">Day 1</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                )}

                {/* Divider + Action */}
                <div className="h-px bg-border mt-4 mb-3" />
                <Button
                  size="sm"
                  variant={enrolled ? 'outline' : 'sage'}
                  className="w-full rounded-xl"
                  onClick={() => {
                    toggle('enrolledPrograms', p.id);
                    toast.success(enrolled ? `Left ${p.title}` : `Enrolled in ${p.title}!`);
                  }}
                >
                  {enrolled ? '✓ Enrolled — Leave Challenge' : 'Join Challenge'}
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