import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const groups = [
  { id: 'anxiety', name: 'Anxiety Allies', members: 1284, desc: 'A safe space to share and cope with anxiety together.', emoji: '🌿' },
  { id: 'students', name: 'Student Wellness', members: 892, desc: 'For students balancing studies and mental wellness.', emoji: '🎓' },
  { id: 'mindful', name: 'Mindful Living', members: 2156, desc: 'Daily mindfulness practice and meditation group.', emoji: '🧘' },
  { id: 'sleep', name: 'Better Sleep Circle', members: 643, desc: 'Tips and support for restful nights.', emoji: '🌙' },
  { id: 'creative', name: 'Creative Healing', members: 421, desc: 'Express feelings through art, writing, and music.', emoji: '🎨' },
];

export default function Community() {
  const navigate = useNavigate();
  const { joinedCommunities, toggle } = useCommunityStore();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-sage pt-safe-top">
        <div className="px-5 pt-6 pb-8">
          <button onClick={() => navigate('/')} className="mb-4 p-2 -ml-2 rounded-lg hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Community</h1>
              <p className="text-sm text-foreground/70">Connect with others on the same journey</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-3">
        {groups.map((g, i) => {
          const joined = joinedCommunities.includes(g.id);
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-soft border border-border"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{g.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{g.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{g.members.toLocaleString()} members</p>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant={joined ? 'outline' : 'sage'}
                  className="flex-1"
                  onClick={() => {
                    toggle('joinedCommunities', g.id);
                    toast.success(joined ? `Left ${g.name}` : `Joined ${g.name}!`);
                  }}
                >
                  {joined ? 'Joined' : 'Join Group'}
                </Button>
                {joined && (
                  <Button size="sm" variant="soft" onClick={() => toast.info('Group chat coming soon')}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
