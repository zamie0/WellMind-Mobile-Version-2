import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Bookmark, Play, FileText, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const resources = [
  { id: 'anxiety-101', title: 'Understanding Anxiety', type: 'article', duration: '5 min read', desc: 'A beginner-friendly guide to anxiety and how it works.', color: 'bg-lavender-light', textColor: 'text-lavender' },
  { id: 'meditation-basics', title: 'Meditation for Beginners', type: 'video', duration: '12 min', desc: 'Learn the foundations of a daily meditation practice.', color: 'bg-sage-light', textColor: 'text-sage' },
  { id: 'sleep-podcast', title: 'The Science of Sleep', type: 'audio', duration: '28 min', desc: 'Why sleep matters and how to improve yours.', color: 'bg-sky-light', textColor: 'text-sky' },
  { id: 'stress-guide', title: 'Stress Management Toolkit', type: 'article', duration: '8 min read', desc: 'Practical strategies to handle daily stressors.', color: 'bg-honey-light', textColor: 'text-honey' },
  { id: 'cbt-intro', title: 'Intro to CBT Techniques', type: 'video', duration: '18 min', desc: 'Cognitive behavioral techniques you can use today.', color: 'bg-sage-light', textColor: 'text-sage' },
  { id: 'mindful-eating', title: 'Mindful Eating Practice', type: 'audio', duration: '15 min', desc: 'Guided exercise for a more present relationship with food.', color: 'bg-coral-light', textColor: 'text-coral' },
];

const iconFor = (t: string) => (t === 'video' ? Play : t === 'audio' ? Headphones : FileText);

const actionLabel = (t: string) => (t === 'article' ? 'Read' : t === 'video' ? 'Watch' : 'Listen');

const typeBadgeColor: Record<string, string> = {
  article: 'bg-lavender-light text-lavender',
  video: 'bg-sage-light text-sage',
  audio: 'bg-sky-light text-sky',
};

export default function Resources() {
  const navigate = useNavigate();
  const { savedResources, toggle } = useCommunityStore();
  const savedCount = savedResources.length;

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
            <h1 className="text-2xl font-bold text-foreground">Resources & Learning</h1>
            <p className="text-muted-foreground">Grow your mental wellness knowledge</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">
        {/* Saved summary */}
        {savedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-lavender-light flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-lavender fill-lavender" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {savedCount} saved {savedCount === 1 ? 'resource' : 'resources'}
              </p>
              <p className="text-xs text-muted-foreground">Ready for you to explore anytime</p>
            </div>
          </motion.div>
        )}

        {/* Resource Cards */}
        <section className="space-y-3">
          {resources.map((r, i) => {
            const Icon = iconFor(r.type);
            const saved = savedResources.includes(r.id);
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  {/* Icon badge */}
                  <div className={`w-12 h-12 rounded-2xl ${r.color} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${r.textColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm leading-snug">{r.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${typeBadgeColor[r.type]}`}>
                        {r.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{r.duration}</p>
                    <p className="text-sm text-muted-foreground leading-snug">{r.desc}</p>
                  </div>
                </div>

                {/* Divider + Actions */}
                <div className="h-px bg-border mt-4 mb-3" />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="sage"
                    className="flex-1 rounded-xl"
                    onClick={() => toast.info(`Opening: ${r.title}`)}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {actionLabel(r.type)}
                  </Button>
                  <Button
                    size="sm"
                    variant={saved ? 'default' : 'outline'}
                    className="rounded-xl gap-1.5"
                    onClick={() => {
                      toggle('savedResources', r.id);
                      toast.success(saved ? 'Removed from saved' : 'Saved!');
                    }}
                  >
                    <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                    {saved ? 'Saved' : 'Save'}
                  </Button>
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