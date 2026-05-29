import { motion } from 'framer-motion';
import { Activity, BedDouble, Brain, Heart, RefreshCw, ShieldCheck, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HealthMetricsCalendar } from './HealthMetricsCalendar';
import type { HealthHistory, HealthSnapshot } from './types';

interface SmartwatchMetricsDashboardProps {
  snapshot: HealthSnapshot;
  history: HealthHistory | null;
  historyLoading?: boolean;
  stressIndex: number;
  onRefresh: () => void;
  onDisconnect: () => void;
}

export const SmartwatchMetricsDashboard = ({
  snapshot,
  history,
  historyLoading,
  stressIndex,
  onRefresh,
  onDisconnect,
}: SmartwatchMetricsDashboardProps) => {
  const isToday = (snapshot.period ?? 'day') === 'day' && (snapshot.periodDays ?? 1) === 1;

  const metrics = [
    {
      icon: Activity,
      label: 'Steps Today',
      value: snapshot.steps.toLocaleString(),
      subtext: isToday ? 'Calendar day total' : `Total over ${snapshot.periodDays ?? 1} days`,
      color: 'bg-sky-light text-sky',
    },
    {
      icon: BedDouble,
      label: 'Sleep',
      value: snapshot.sleepHours > 0 ? `${snapshot.sleepHours.toFixed(1)}h` : 'No data',
      subtext:
        snapshot.sleepHours > 0
          ? `Score ${snapshot.sleepScore}${isToday ? ' · last night' : ' · daily avg'}`
          : 'Allow sleep access in Health Connect',
      color: 'bg-lavender-light text-lavender',
    },
    {
      icon: Heart,
      label: 'Heart Rate',
      value: snapshot.restingHr > 0 ? `${snapshot.restingHr} BPM` : 'No data',
      subtext: snapshot.restingHr > 0 ? 'Average for this period' : 'Sync from watch or ring',
      color: 'bg-coral-light text-coral',
    },
    {
      icon: Wind,
      label: 'Blood Oxygen',
      value: snapshot.spo2 > 0 ? `${snapshot.spo2}%` : 'No data',
      subtext: snapshot.spo2 > 0 ? 'Average SpO₂' : 'Grant oxygen permission if supported',
      color: 'bg-sage-light text-sage',
    },
  ];

  const readiness = snapshot.recovery || Math.max(0, 100 - stressIndex);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-sage">
              <ShieldCheck className="h-4 w-4" />
              Health Connect connected
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Smartwatch Metrics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isToday && snapshot.date ? `Today (${snapshot.date})` : 'Summary'} · Last sync{' '}
              {snapshot.lastSyncAt || 'just now'} · Stress {snapshot.stressLevel}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onRefresh} title="Refresh today's data">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl bg-background p-4"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.subtext}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <HealthMetricsCalendar history={history} loading={historyLoading} />

      <div className="rounded-2xl bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Mind-Body Readiness</h3>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(readiness, 100)}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Readiness blends recovery score with your WellMind stress trend. Use it as a gentle wellness cue, not a
          diagnosis.
        </p>
        <Button variant="outline" className="mt-4 w-full border-coral/30 text-coral hover:bg-coral/10" onClick={onDisconnect}>
          Hide Smartwatch Dashboard
        </Button>
      </div>
    </motion.section>
  );
};

export default SmartwatchMetricsDashboard;
