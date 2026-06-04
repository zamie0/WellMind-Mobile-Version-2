import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { INSIGHT_PERIOD_LABELS, type HealthInsightPeriod } from './types';

interface InsightPeriodTabsProps {
  value: HealthInsightPeriod;
  onChange: (period: HealthInsightPeriod) => void;
}

export const InsightPeriodTabs = ({ value, onChange }: InsightPeriodTabsProps) => (
  <Tabs
    value={value}
    onValueChange={(next) => onChange(next as HealthInsightPeriod)}
    className="w-full"
  >
    <TabsList className="grid w-full grid-cols-3 h-9">
      {(Object.keys(INSIGHT_PERIOD_LABELS) as HealthInsightPeriod[]).map((period) => (
        <TabsTrigger key={period} value={period} className="text-xs sm:text-sm">
          {INSIGHT_PERIOD_LABELS[period]}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default InsightPeriodTabs;
