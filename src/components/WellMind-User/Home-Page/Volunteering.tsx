import { motion } from 'framer-motion';
import { ArrowLeft, HandHeart, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const opportunities = [
  { id: 'listener', title: 'Counselor Listener', org: 'WellMind Foundation', location: 'Remote', hours: '2 hrs/week', desc: 'Provide a compassionate ear for those who need to talk.' },
  { id: 'workshop', title: 'Workshop Facilitator', org: 'Campus Wellness', location: 'Hybrid', hours: '4 hrs/month', desc: 'Help run mindfulness sessions for students.' },
  { id: 'content', title: 'Content Creator', org: 'Mind Matters', location: 'Remote', hours: 'Flexible', desc: 'Write articles and stories about mental wellness.' },
  { id: 'outreach', title: 'Community Outreach', org: 'Hope Network', location: 'Local', hours: '3 hrs/week', desc: 'Connect with underserved communities in your area.' },
];

export default function Volunteering() {
  const navigate = useNavigate();
  const { volunteerSignups, toggle } = useCommunityStore();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-sage pt-safe-top">
        <div className="px-5 pt-6 pb-8">
          <button onClick={() => navigate('/')} className="mb-4 p-2 -ml-2 rounded-lg hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
              <HandHeart className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Volunteering</h1>
              <p className="text-sm text-foreground/70">Give back to your community</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-3">
        {opportunities.map((o, i) => {
          const signed = volunteerSignups.includes(o.id);
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-soft border border-border"
            >
              <h3 className="font-semibold text-foreground">{o.title}</h3>
              <p className="text-xs text-primary mb-2">{o.org}</p>
              <p className="text-sm text-muted-foreground mb-3">{o.desc}</p>
              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{o.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{o.hours}</span>
              </div>
              <Button
                size="sm"
                variant={signed ? 'outline' : 'sage'}
                className="w-full"
                onClick={() => {
                  toggle('volunteerSignups', o.id);
                  toast.success(signed ? `Withdrew from ${o.title}` : `Signed up for ${o.title}!`);
                }}
              >
                {signed ? 'Signed Up ✓' : 'Sign Up'}
              </Button>
            </motion.div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
