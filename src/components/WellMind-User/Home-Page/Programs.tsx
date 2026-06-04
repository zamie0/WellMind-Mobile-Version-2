import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const programs = [
  { id: '7day-calm', title: '7-Day Calm Challenge', duration: '7 days', participants: 1245, desc: 'Daily breathing & mindfulness for one week.', reward: '70 Calm Coins' },
  { id: '21-gratitude', title: '21 Days of Gratitude', duration: '21 days', participants: 893, desc: 'Build a gratitude habit that lasts.', reward: '210 Calm Coins' },
  { id: 'sleep-reset', title: 'Sleep Reset Program', duration: '14 days', participants: 567, desc: 'Reset your sleep cycle with guided practices.', reward: '140 Calm Coins' },
  { id: 'mood-master', title: 'Mood Mastery', duration: '30 days', participants: 432, desc: 'Track and understand your emotional patterns.', reward: '300 Calm Coins' },
];

export default function Programs() {
  const navigate = useNavigate();
  const { enrolledPrograms, toggle } = useCommunityStore();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-sage pt-safe-top">
        <div className="px-5 pt-6 pb-8">
          <button onClick={() => navigate('/')} className="mb-4 p-2 -ml-2 rounded-lg hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Programs & Challenges</h1>
              <p className="text-sm text-foreground/70">Build healthy habits together</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-3">
        {programs.map((p, i) => {
          const enrolled = enrolledPrograms.includes(p.id);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-soft border border-border"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />{p.duration} · {p.participants} joined
                  </p>
                </div>
                <span className="text-xs font-semibold text-coral bg-coral-light px-2 py-1 rounded-full">{p.reward}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
              {enrolled && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">Day 1</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              )}
              <Button
                size="sm"
                variant={enrolled ? 'outline' : 'sage'}
                className="w-full"
                onClick={() => {
                  toggle('enrolledPrograms', p.id);
                  toast.success(enrolled ? `Left ${p.title}` : `Enrolled in ${p.title}!`);
                }}
              >
                {enrolled ? 'Enrolled ✓' : 'Join Challenge'}
              </Button>
            </motion.div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
