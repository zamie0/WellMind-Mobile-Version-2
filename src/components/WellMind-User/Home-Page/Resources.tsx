import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Bookmark, Play, FileText, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const resources = [
  { id: 'anxiety-101', title: 'Understanding Anxiety', type: 'article', duration: '5 min read', desc: 'A beginner-friendly guide to anxiety and how it works.' },
  { id: 'meditation-basics', title: 'Meditation for Beginners', type: 'video', duration: '12 min', desc: 'Learn the foundations of a daily meditation practice.' },
  { id: 'sleep-podcast', title: 'The Science of Sleep', type: 'audio', duration: '28 min', desc: 'Why sleep matters and how to improve yours.' },
  { id: 'stress-guide', title: 'Stress Management Toolkit', type: 'article', duration: '8 min read', desc: 'Practical strategies to handle daily stressors.' },
  { id: 'cbt-intro', title: 'Intro to CBT Techniques', type: 'video', duration: '18 min', desc: 'Cognitive behavioral techniques you can use today.' },
  { id: 'mindful-eating', title: 'Mindful Eating Practice', type: 'audio', duration: '15 min', desc: 'Guided exercise for a more present relationship with food.' },
];

const iconFor = (t: string) => (t === 'video' ? Play : t === 'audio' ? Headphones : FileText);

export default function Resources() {
  const navigate = useNavigate();
  const { savedResources, toggle } = useCommunityStore();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-sage pt-safe-top">
        <div className="px-5 pt-6 pb-8">
          <button onClick={() => navigate('/')} className="mb-4 p-2 -ml-2 rounded-lg hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resources & Learning</h1>
              <p className="text-sm text-foreground/70">Grow your mental wellness knowledge</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-3">
        {resources.map((r, i) => {
          const Icon = iconFor(r.type);
          const saved = savedResources.includes(r.id);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-soft border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  <p className="text-xs text-muted-foreground capitalize mb-1">{r.type} · {r.duration}</p>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="sage" className="flex-1" onClick={() => toast.info(`Opening: ${r.title}`)}>
                  {r.type === 'article' ? 'Read' : r.type === 'video' ? 'Watch' : 'Listen'}
                </Button>
                <Button
                  size="sm"
                  variant={saved ? 'default' : 'outline'}
                  onClick={() => {
                    toggle('savedResources', r.id);
                    toast.success(saved ? 'Removed from saved' : 'Saved!');
                  }}
                >
                  <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
