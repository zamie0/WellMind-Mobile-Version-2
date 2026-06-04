import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';

export const HealingGoals = () => {
  const healingGoals = useWellMindStore((state) => state.healingGoals);
  const toggleHealingGoal = useWellMindStore((state) => state.toggleHealingGoal);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-1">Healing Goals</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Gentle steps to support your healing today 🌱
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-4 shadow-soft space-y-3"
      >
        {healingGoals.map((goal) => (
          <button
            key={goal.id}
            type="button"
            onClick={() => toggleHealingGoal(goal.id)}
            className={`w-full text-left rounded-3xl border border-input/70 p-4 transition-colors duration-200 ${
              goal.completed ? 'bg-sage/10 border-sage/40' : 'bg-background hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80 text-xl">
                {goal.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{goal.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {goal.completed ? (
                      <span className="text-sage">Completed</span>
                    ) : goal.optional ? (
                      <span className="text-muted-foreground">Optional</span>
                    ) : (
                      <span className="text-primary">Tap to complete</span>
                    )}
                    {goal.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-sage" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}

        <div className="mt-2 rounded-2xl bg-muted/40 p-3 text-sm text-muted-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-sage" />
          Healing is not a race. Doing one small thing is enough.
        </div>
      </motion.div>
    </section>
  );
};
