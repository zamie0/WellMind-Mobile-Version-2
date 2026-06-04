import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, startOfDay, subDays } from 'date-fns';
import { Activity, BedDouble, CalendarDays, Heart, Wind } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { HealthDayRecord, HealthHistory } from './types';

interface HealthMetricsCalendarProps {
  history: HealthHistory | null;
  loading?: boolean;
}

const toIsoDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const HealthMetricsCalendar = ({ history, loading }: HealthMetricsCalendarProps) => {
  const historyDays = history?.historyDays ?? 14;
  const today = startOfDay(new Date());
  const oldest = subDays(today, historyDays - 1);

  const dayByDate = useMemo(() => {
    const map = new Map<string, HealthDayRecord>();
    history?.days.forEach((day) => map.set(day.date, day));
    return map;
  }, [history?.days]);

  const datesWithData = useMemo(
    () =>
      history?.days
        .filter((d) => d.steps > 0 || d.sleepHours > 0 || d.heartRate > 0 || d.spo2 > 0)
        .map((d) => parseISO(d.date)) ?? [],
    [history?.days]
  );

  const [selected, setSelected] = useState<Date>(today);
  const [visibleMonth, setVisibleMonth] = useState<Date>(today);

  useEffect(() => {
    if (!history?.days.length) return;
    const now = startOfDay(new Date());
    setSelected(now);
    setVisibleMonth(now);
  }, [history?.days.length, history?.historyDays]);

  const selectedIso = toIsoDate(selected);
  const selectedDay = dayByDate.get(selectedIso);

  const hasAnyMetric = (day: HealthDayRecord) =>
    day.steps > 0 || day.sleepHours > 0 || day.heartRate > 0 || day.spo2 > 0;

  const detailItems = selectedDay
    ? [
        {
          icon: Activity,
          label: 'Steps',
          value: selectedDay.steps > 0 ? selectedDay.steps.toLocaleString() : '—',
          ok: selectedDay.steps > 0,
        },
        {
          icon: BedDouble,
          label: 'Sleep',
          value: selectedDay.sleepHours > 0 ? `${selectedDay.sleepHours.toFixed(1)} h` : '—',
          ok: selectedDay.sleepHours > 0,
        },
        {
          icon: Heart,
          label: 'Heart rate',
          value: selectedDay.heartRate > 0 ? `${selectedDay.heartRate} bpm` : '—',
          ok: selectedDay.heartRate > 0,
        },
        {
          icon: Wind,
          label: 'Oxygen',
          value: selectedDay.spo2 > 0 ? `${selectedDay.spo2}%` : '—',
          ok: selectedDay.spo2 > 0,
        },
      ]
    : [];

  return (
    <div className="rounded-2xl bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">Daily history</h3>
          <p className="text-xs text-muted-foreground">Tap a day to view steps, sleep, heart rate & oxygen</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground mb-3">Loading calendar…</p> : null}

      <div className="flex justify-center rounded-xl bg-background p-2">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => date && setSelected(startOfDay(date))}
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          disabled={(date) => date > today || date < oldest}
          modifiers={{ hasData: datesWithData }}
          modifiersClassNames={{
            hasData:
              'relative font-semibold after:absolute after:bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary',
          }}
          className="pointer-events-auto"
        />
      </div>

      <div className="mt-4 rounded-xl bg-background p-4 border border-border/40">
        <p className="text-sm font-medium text-foreground mb-3">
          {format(selected, 'EEEE, MMM d')}
          {selectedIso === toIsoDate(today) ? ' · Today' : ''}
        </p>

        {!selectedDay || !hasAnyMetric(selectedDay) ? (
          <p className="text-sm text-muted-foreground">
            No Health Connect data for this day. Pick another date or sync your watch.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {detailItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    item.ok ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={cn('text-sm font-semibold', item.ok ? 'text-foreground' : 'text-muted-foreground')}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthMetricsCalendar;
