import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';
import { CheckCircle2, Target } from 'lucide-react';

const getTodayName = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' });

export const YourGoals = () => {
  const weeklyPlan = useWellMindStore((state) => state.weeklyPlan);
  const generateWeeklyPlan = useWellMindStore((state) => state.generateWeeklyPlan);
  const completeTask = useWellMindStore((state) => state.completeTask);

  const todayName = getTodayName();
  const todaysTasks = weeklyPlan
    ? weeklyPlan.tasks.filter((task) => task.day === todayName)
    : [];
  const displayTasks = todaysTasks.length ? todaysTasks : weeklyPlan?.tasks.slice(0, 3) ?? [];
  const completedCount = weeklyPlan?.tasks.filter((task) => task.completed).length ?? 0;
  const totalTasks = weeklyPlan?.tasks.length ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Your Goals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {weeklyPlan
              ? todaysTasks.length
                ? `Today’s goals for ${todayName}`
                : 'Your next goals from the weekly plan'
              : 'Generate a self-care plan tailored to your mood.'}
          </p>
        </div>
        {weeklyPlan && (
          <span className="rounded-full bg-sage/10 px-3 py-1 text-sm font-medium text-sage">
            {completedCount} / {totalTasks} done
          </span>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-4 shadow-soft space-y-4"
      >
        {!weeklyPlan ? (
          <div className="space-y-4 rounded-3xl border border-input/70 bg-background p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Generate a weekly goals roadmap, then complete tasks to earn Calm Coins and momentum.
            </p>
            <Button variant="outline" className="mx-auto" onClick={generateWeeklyPlan}>
              Generate Goals
            </Button>
          </div>
        ) : (
          <>
            {displayTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 rounded-3xl border border-input/70 bg-background p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-light text-sky">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {task.day}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-sm font-semibold ${task.completed ? 'text-sage' : 'text-muted-foreground'}`}>
                    {task.completed ? 'Completed' : 'Incomplete'}
                  </span>
                  <button
                    type="button"
                    onClick={() => completeTask(task.id)}
                    disabled={task.completed}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                      task.completed
                        ? 'cursor-not-allowed border border-sage/40 bg-sage/10 text-sage'
                        : 'bg-sage text-white hover:bg-sage/90'
                    }`}
                  >
                    {task.completed ? 'Done' : 'Mark Done'}
                  </button>
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>Weekly progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-sage" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
};
