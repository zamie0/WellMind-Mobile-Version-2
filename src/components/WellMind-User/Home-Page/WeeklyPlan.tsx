import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Check, Wind, BookOpen, Heart, Dumbbell, 
  Users, Moon, ChevronRight, Sparkles, RefreshCw
} from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { DailyTask } from '@/types/wellmind';

const taskIcons: Record<DailyTask['type'], React.ElementType> = {
  breathing: Wind,
  journal: BookOpen,
  affirmation: Heart,
  exercise: Dumbbell,
  social: Users,
  rest: Moon,
};

const taskColors: Record<DailyTask['type'], string> = {
  breathing: 'bg-sky/20 text-sky',
  journal: 'bg-lavender/20 text-lavender',
  affirmation: 'bg-coral/20 text-coral',
  exercise: 'bg-primary/20 text-primary',
  social: 'bg-honey/20 text-honey',
  rest: 'bg-muted text-muted-foreground',
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WeeklyPlan = () => {
  const { weeklyPlan, moodEntries, generateWeeklyPlan, completeTask } = useWellMindStore();
  const [selectedDay, setSelectedDay] = useState<string>(() => DAYS[new Date().getDay()]);

  useEffect(() => {
    if (!weeklyPlan && moodEntries.length > 0) {
      generateWeeklyPlan();
    }
  }, [weeklyPlan, moodEntries.length, generateWeeklyPlan]);

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    toast.success('+8 Calm Coins earned!', {
      description: 'Great job completing your wellness task!',
    });
  };

  const handleRegenerate = () => {
    generateWeeklyPlan();
    toast.success('New weekly plan generated!');
  };

  if (!weeklyPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Weekly Wellness Plan</h3>
            <p className="text-xs text-muted-foreground">Personalized for you</p>
          </div>
        </div>
        
        {moodEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Log your first mood to generate a personalized weekly plan.
          </p>
        ) : (
          <Button onClick={generateWeeklyPlan} className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate My Plan
          </Button>
        )}
      </motion.div>
    );
  }

  const dayTasks = weeklyPlan.tasks.filter(t => t.day === selectedDay);
  const completedToday = dayTasks.filter(t => t.completed).length;
  const totalTasks = weeklyPlan.tasks.length;
  const completedTotal = weeklyPlan.tasks.filter(t => t.completed).length;
  const progress = (completedTotal / totalTasks) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Weekly Plan</h3>
            <p className="text-xs text-muted-foreground">
              {completedTotal}/{totalTasks} tasks completed
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRegenerate} className="h-8 w-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary to-primary-glow"
          />
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {DAYS.map((day, index) => {
          const dayTaskCount = weeklyPlan.tasks.filter(t => t.day === day).length;
          const dayCompletedCount = weeklyPlan.tasks.filter(t => t.day === day && t.completed).length;
          const isToday = day === DAYS[new Date().getDay()];
          const isSelected = day === selectedDay;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all min-w-[48px] ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="text-[10px] font-medium">{day.slice(0, 3)}</span>
              <span className="text-xs">{dayCompletedCount}/{dayTaskCount}</span>
            </button>
          );
        })}
      </div>

      {/* Tasks for Selected Day */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {dayTasks.map((task, index) => {
            const Icon = taskIcons[task.type];
            const colorClass = taskColors[task.type];
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                </div>
                {task.completed ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCompleteTask(task.id)}
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {dayTasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks for {selectedDay}
          </p>
        )}
      </div>
    </motion.div>
  );
};
