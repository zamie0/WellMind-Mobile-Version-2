import { TrendingUp } from 'lucide-react';
import type { HealthInsightPeriod } from './types';

interface TrendHighlightsSectionProps {
  period: HealthInsightPeriod;
  highlights: string[];
  loading?: boolean;
  error?: string | null;
}

/** Standalone trend block (tabs live on parent InsightsHealthPanels). */
export const TrendHighlightsSection = ({ period, highlights, loading, error }: TrendHighlightsSectionProps) => (
  <section className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-coral" />
      Trend Highlights
    </h2>

    {loading ? <p className="text-sm text-muted-foreground">Loading Health Connect trends…</p> : null}
    {error ? <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p> : null}

    <div className="space-y-2">
      {highlights.map((item, index) => (
        <p key={`${period}-trend-${index}`} className="text-sm text-muted-foreground">
          {item}
        </p>
      ))}
    </div>
  </section>
);

export default TrendHighlightsSection;
