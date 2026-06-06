import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WeeklyPlan } from '@/components/WellMind-User/Home-Page/WeeklyPlan';
import { BottomNav } from '@/components/WellMind-User/BottomNav';

const WellnessPlan = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
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
            <h1 className="text-2xl font-bold text-foreground">Wellness Plan</h1>
            <p className="text-muted-foreground">Your personalized 7-day journey</p>
          </motion.div>
        </div>
      </header>
      <main className="px-5 py-6">
        <WeeklyPlan />
      </main>
      <BottomNav />
    </div>
  );
};

export default WellnessPlan;
