import { useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { InsightPeriodTabs } from './InsightPeriodTabs';
import type { HealthInsightPeriod } from './types';
import { useInsightAnalytics } from './useInsightAnalytics';
import { usePeriodHealthSnapshot } from './usePeriodHealthSnapshot';

interface InsightsHealthPanelsProps {
  healthLinked: boolean;
}

/** Trend + Deep insights with one shared Day / Week / Month control. */
export const InsightsHealthPanels = ({ healthLinked }: InsightsHealthPanelsProps) => {
  const [period, setPeriod] = useState<HealthInsightPeriod>('day');
  const { periodHealth, loading, error } = usePeriodHealthSnapshot(healthLinked, period);
  const { trendHighlights, deepInsights } = useInsightAnalytics({
    period,
    periodHealth,
    healthLinked,
  });

  return (
    <section className="bg-card rounded-2xl p-5 shadow-soft space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Health insights</h2>
          <p className="text-sm text-muted-foreground">Mood patterns combined with wearable data</p>
        </div>
        <InsightPeriodTabs value={period} onChange={setPeriod} />
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading Health Connect data…</p> : null}
      {error ? <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p> : null}

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-coral" />
          Trend highlights
        </h3>
        <div className="space-y-2 pl-1">
          {trendHighlights.map((item, index) => (
            <p key={`${period}-trend-${index}`} className="text-sm text-muted-foreground">
              {item}
            </p>
          ))}
        </div>
      </div>

      <div className="border-t border-border/50 pt-5 space-y-3">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-sage" />
          Deep insights
        </h3>
        <div className="space-y-3 pl-1">
          {deepInsights.map((item, index) => (
            <p key={`${period}-deep-${index}`} className="text-sm text-muted-foreground">
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsightsHealthPanels;
