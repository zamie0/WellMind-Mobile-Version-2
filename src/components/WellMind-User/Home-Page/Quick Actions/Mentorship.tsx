import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Star, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

import {
  Flower,
  Waves,
  Leaf,
  GraduationCap,
} from 'lucide-react';

const mentors = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    specialty: 'Anxiety & Stress',
    experience: '8 years',
    rating: 4.9,
    bio: 'Licensed counselor passionate about helping young adults.',
    icon: Flower,
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    specialty: 'Career & Burnout',
    experience: '12 years',
    rating: 4.8,
    bio: 'Helps professionals find balance and meaning.',
    icon: Waves,
  },
  {
    id: 'aisha',
    name: 'Aisha Patel',
    specialty: 'Mindfulness Coach',
    experience: '6 years',
    rating: 5.0,
    bio: 'Guides you through meditation and mindful living.',
    icon: Leaf,
  },
  {
    id: 'david',
    name: 'David Kim',
    specialty: 'Student Wellness',
    experience: '5 years',
    rating: 4.7,
    bio: 'Former teacher, now mentoring students through challenges.',
    icon: GraduationCap,
  },
];

export default function Mentorship() {
  const navigate = useNavigate();
  const { mentorRequests, toggle } = useCommunityStore();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem]">
        <div className="pt-6">
          <button onClick={() => navigate('/')} className="mb-4 p-2 -ml-2 rounded-lg hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mentorship</h1>
              <p className="text-sm text-foreground/70">Get guidance from those who've been there</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-3">
        {mentors.map((m, i) => {
          const requested = mentorRequests.includes(m.id);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-soft border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
                  <m.icon className="w-7 h-7 text-foreground stroke-[1.5]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{m.name}</h3>
                    <span className="flex items-center gap-1 text-xs text-honey">
                      <Star className="h-3 w-3 fill-honey" />{m.rating}
                    </span>
                  </div>
                  <p className="text-xs text-primary mb-1">{m.specialty}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Briefcase className="h-3 w-3" />{m.experience} experience
                  </p>
                  <p className="text-sm text-muted-foreground">{m.bio}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={requested ? 'outline' : 'sage'}
                className="w-full mt-3"
                onClick={() => {
                  toggle('mentorRequests', m.id);
                  toast.success(requested ? 'Request cancelled' : `Request sent to ${m.name}!`);
                }}
              >
                {requested ? 'Request Pending ✓' : 'Request Mentorship'}
              </Button>
            </motion.div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
