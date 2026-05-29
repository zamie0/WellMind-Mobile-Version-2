import { Target } from 'lucide-react';
import type { HealthInsightPeriod } from './types';

interface DeepInsightsSectionProps {
  period: HealthInsightPeriod;
  insights: string[];
  loading?: boolean;
  error?: string | null;
}

/** Standalone deep insights block (tabs live on parent InsightsHealthPanels). */
export const DeepInsightsSection = ({ period, insights, loading, error }: DeepInsightsSectionProps) => (
  <section className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
      <Target className="h-5 w-5 text-sage" />
      Deep Insights
    </h2>

    {loading ? <p className="text-sm text-muted-foreground">Analyzing mood + wearable data…</p> : null}
    {error ? <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p> : null}

    <div className="space-y-3">
      {insights.map((item, index) => (
        <p key={`${period}-deep-${index}`} className="text-sm text-muted-foreground">
          {item}
        </p>
      ))}
    </div>
  </section>
);

export default DeepInsightsSection;
