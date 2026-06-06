import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

import {
  Leaf,
  GraduationCap,
  Brain,
  Moon,
  Palette,
} from 'lucide-react';

const groups = [
  {
    id: 'anxiety',
    name: 'Anxiety Allies',
    members: 1284,
    desc: 'A safe space to share and cope with anxiety together.',
    icon: Leaf,
    color: 'bg-sage-light',
  },
  {
    id: 'students',
    name: 'Student Wellness',
    members: 892,
    desc: 'For students balancing studies and mental wellness.',
    icon: GraduationCap,
    color: 'bg-honey-light',
  },
  {
    id: 'mindful',
    name: 'Mindful Living',
    members: 2156,
    desc: 'Daily mindfulness practice and meditation group.',
    icon: Brain,
    color: 'bg-lavender-light',
  },
  {
    id: 'sleep',
    name: 'Better Sleep Circle',
    members: 643,
    desc: 'Tips and support for restful nights.',
    icon: Moon,
    color: 'bg-sky-light',
  },
  {
    id: 'creative',
    name: 'Creative Healing',
    members: 421,
    desc: 'Express feelings through art, writing, and music.',
    icon: Palette,
    color: 'bg-coral-light',
  },
];

export default function Community() {
  const navigate = useNavigate();
  const { joinedCommunities, toggle } = useCommunityStore();
  const joinedCount = joinedCommunities.length;

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
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground">Connect with others on the same journey</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">
        {/* Stats bar */}
        {joinedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-sage" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                You've joined {joinedCount} {joinedCount === 1 ? 'group' : 'groups'}
              </p>
              <p className="text-xs text-muted-foreground">Keep engaging with your communities</p>
            </div>
          </motion.div>
        )}

        {/* Group Cards */}
        <section className="space-y-3">
          {groups.map((g, i) => {
            const joined = joinedCommunities.includes(g.id);
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  {/* Emoji badge */}
                  <div className={`w-12 h-12 rounded-2xl ${g.color} flex items-center justify-center shrink-0`}>
                    <g.icon className="w-6 h-6 text-foreground stroke-[1.5]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground truncate">{g.name}</h3>
                      {joined && (
                        <span className="text-xs font-medium text-sage bg-sage-light px-2 py-0.5 rounded-full shrink-0">
                          Joined
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 mb-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{g.members.toLocaleString()} members</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{g.desc}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant={joined ? 'outline' : 'sage'}
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      toggle('joinedCommunities', g.id);
                      toast.success(joined ? `Left ${g.name}` : `Joined ${g.name}!`);
                    }}
                  >
                    {joined ? 'Leave Group' : 'Join Group'}
                  </Button>
                  {joined && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1.5"
                      onClick={() => toast.info('Group chat coming soon')}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Button>
                  )}
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