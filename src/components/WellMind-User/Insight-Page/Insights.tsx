import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { useWellMindStore } from '@/stores/wellmindStore';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { MoodChart } from '@/components/WellMind-User/Home-Page/MoodChart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import SmartwatchInsights from './Smartwatch/SmartwatchInsights';
import type { Emotion } from '@/types/wellmind';
import {
    Activity,
    Clock3,
    Brain,
    Flame,
    MoonStar,
    Sparkles,
    ShieldAlert,
    Target,
    TrendingUp,
} from 'lucide-react';

const emotionLabels: Record<Emotion, string> = {
    happy: 'Happy',
    neutral: 'Okay',
    sad: 'Sad',
    anxious: 'Anxious',
    stressed: 'Stressed',
    exhausted: 'Exhausted',
    numb: 'Numb',
};

const emotionScore: Record<Emotion, number> = {
    happy: 5,
    neutral: 4,
    numb: 3,
    anxious: 2,
    stressed: 2,
    sad: 1,
    exhausted: 1,
};

const ranges = [7, 30, 90] as const;

export const Insights = () => {
    const [selectedRange, setSelectedRange] = useState<(typeof ranges)[number]>(7);
    const moodEntries = useWellMindStore((state) => state.moodEntries);
    const currentStreak = useWellMindStore((state) => state.currentStreak);
    const weeklyPlan = useWellMindStore((state) => state.weeklyPlan);
    const moodPrediction = useWellMindStore((state) => state.moodPrediction);
    const calmCoins = useWellMindStore((state) => state.calmCoins);
    const badges = useWellMindStore((state) => state.badges);

    const sortedEntries = useMemo(
        () => [...moodEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        [moodEntries]
    );

    const rangedEntries = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - selectedRange);
        return sortedEntries.filter((entry) => new Date(entry.timestamp) >= cutoff);
    }, [selectedRange, sortedEntries]);

    const moodScoreTrend = useMemo(() => {
        const grouped = new Map<string, { total: number; count: number }>();
        rangedEntries.forEach((entry) => {
            const day = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const prev = grouped.get(day) ?? { total: 0, count: 0 };
            grouped.set(day, { total: prev.total + emotionScore[entry.emotion], count: prev.count + 1 });
        });

        return Array.from(grouped.entries()).map(([day, value]) => ({
            day,
            mood: Number((value.total / value.count).toFixed(1)),
            count: value.count,
        }));
    }, [rangedEntries]);

    const planCompletion = useMemo(() => {
        if (!weeklyPlan?.tasks.length) return 0;
        const completed = weeklyPlan.tasks.filter((task) => task.completed).length;
        return Math.round((completed / weeklyPlan.tasks.length) * 100);
    }, [weeklyPlan]);

    const moodCounts = useMemo(
        () =>
            rangedEntries.reduce((acc, entry) => {
                acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
                return acc;
            }, {} as Record<Emotion, number>),
        [rangedEntries]
    );

    const dominantMood = useMemo(() => {
        const top = Object.entries(moodCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
        return top ? (top[0] as Emotion) : null;
    }, [moodCounts]);

    const stressIndex = useMemo(() => {
        if (!rangedEntries.length) return 0;
        const stressSignals = rangedEntries.filter((entry) =>
            ['anxious', 'stressed', 'exhausted', 'sad'].includes(entry.emotion)
        ).length;
        return Math.round((stressSignals / rangedEntries.length) * 100);
    }, [rangedEntries]);

    const topSummaryCards = [
        {
            icon: <Activity className="h-5 w-5" />,
            label: 'Check-ins',
            value: String(rangedEntries.length),
            subtext: `${selectedRange}-day mood entries`,
            color: 'bg-sky-light text-sky',
        },
        {
            icon: <Brain className="h-5 w-5" />,
            label: 'Dominant Mood',
            value: dominantMood ? emotionLabels[dominantMood] : 'Building',
            subtext: dominantMood ? 'Most frequent mood signal' : 'Log moods to unlock',
            color: 'bg-lavender-light text-lavender',
        },
        {
            icon: <TrendingUp className="h-5 w-5" />,
            label: 'Stress Index',
            value: `${stressIndex}%`,
            subtext: 'Mood-based pressure estimate',
            color: 'bg-coral-light text-coral',
        },
        {
            icon: <Target className="h-5 w-5" />,
            label: 'Plan Progress',
            value: `${planCompletion}%`,
            subtext: 'Weekly wellness plan',
            color: 'bg-sage-light text-sage',
        },
    ];

    const activityBreakdown = [
        { type: 'Mindful Walk', duration: `${12 + Math.round(selectedRange / 2)} min`, calories: `${160 + selectedRange * 2} kcal`, pace: 'Wellness pace' },
        { type: 'Breathing Session', duration: `${6 + Math.round(planCompletion / 20)} min`, calories: '35 kcal', pace: 'Recovery focused' },
        { type: 'Mood Journaling', duration: `${5 + Math.round(rangedEntries.length / 4)} min`, calories: '15 kcal', pace: 'Cognitive unload' },
    ];

    const deepInsights = [
        dominantMood
            ? `Your dominant mood in the last ${selectedRange} days is ${emotionLabels[dominantMood]}, which is shaping your resilience trend.`
            : `Start logging moods to unlock advanced pattern analysis for the last ${selectedRange} days.`,
        `Weekly plan adherence is ${planCompletion}%, which helps anchor your daily wellness rhythm.`,
        `Stress index is ${stressIndex}%. Breathing trend is healthier when this stays under 40%.`,
        moodPrediction
            ? `Predicted tomorrow mood: ${emotionLabels[moodPrediction.predictedMood]} (${moodPrediction.confidence}% confidence).`
            : 'Add at least 3 mood check-ins to unlock prediction-driven recommendations.',
    ];

    const trendHighlights = [
        `Mood consistency trend is ${moodScoreTrend.length >= 5 ? 'stable' : 'building'} across ${selectedRange} days.`,
        `Current streak: ${currentStreak} day(s), with ${calmCoins} Calm Coins earned momentum.`,
        `${badges.length} badge(s) unlocked. Gamification engagement is boosting routine adherence.`,
        stressIndex > 60
            ? 'Stress burden is elevated. Prioritize sleep quality + short midday recovery blocks.'
            : 'Stress burden is in a healthy range. Keep stacking routines for long-term resilience.',
    ];

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="px-5 pt-safe-top">
                <div className="pt-6 pb-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-foreground"
                    >
                        Your Insights
                    </motion.h1>
                    <p className="text-muted-foreground">
                        Mental wellness intelligence dashboard
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Smartwatch tracking is optional and appears after Health Connect permission.
                    </p>
                </div>
            </header>

            <main className="px-5 py-4 space-y-6">
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-4 shadow-soft"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Insight Range</p>
                        <div className="flex gap-2">
                            {ranges.map((range) => (
                                <button
                                    key={range}
                                    type="button"
                                    onClick={() => setSelectedRange(range)}
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedRange === range
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                        }`}
                                >
                                    {range}D
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                >
                    {topSummaryCards.map((card, index) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card rounded-2xl p-4 shadow-soft"
                        >
                            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                                {card.icon}
                            </div>
                            <p className="text-2xl font-bold text-foreground">{card.value}</p>
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <MoodChart />

                <SmartwatchInsights stressIndex={stressIndex} />

                <section className="bg-card rounded-2xl p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-sky" />
                        Signals Correlation
                    </h2>
                    <ChartContainer
                        className="h-[220px] w-full"
                        config={{
                            mood: { label: 'Mood Score', color: 'hsl(var(--sky))' },
                            count: { label: 'Check-ins', color: 'hsl(var(--coral))' },
                        }}
                    >
                        <LineChart data={moodScoreTrend}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                dataKey="mood"
                                type="monotone"
                                stroke="var(--color-mood)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-mood)', r: 3 }}
                            />
                            <Line
                                dataKey="count"
                                type="monotone"
                                stroke="var(--color-count)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-count)', r: 3 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </section>

                <section className="bg-card rounded-2xl p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MoonStar className="h-5 w-5 text-lavender" />
                        Plan and Stress Breakdown
                    </h2>
                    <ChartContainer
                        className="h-[220px] w-full"
                        config={{
                            plan: { label: 'Plan Progress', color: 'hsl(var(--sage))' },
                            stress: { label: 'Stress Load', color: 'hsl(var(--coral))' },
                        }}
                    >
                        <BarChart
                            data={[
                                { label: 'Plan', plan: planCompletion },
                                { label: 'Stress', stress: stressIndex },
                            ]}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="plan" fill="var(--color-plan)" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="stress" fill="var(--color-stress)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </section>

                <section className="bg-card rounded-2xl p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-coral" />
                        Trend Highlights (7/30/90 days)
                    </h2>
                    <div className="space-y-2">
                        {trendHighlights.map((item) => (
                            <p key={item} className="text-sm text-muted-foreground">
                                {item}
                            </p>
                        ))}
                    </div>
                </section>

                <section className="bg-card rounded-2xl p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-sage" />
                        Deep Insights
                    </h2>
                    <div className="space-y-3">
                        {deepInsights.map((item) => (
                            <p key={item} className="text-sm text-muted-foreground">
                                {item}
                            </p>
                        ))}
                    </div>
                </section>

                <section className="bg-card rounded-2xl p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Flame className="h-5 w-5 text-coral" />
                        Activity Breakdown
                    </h2>
                    <div className="space-y-3">
                        {activityBreakdown.map((session) => (
                            <div key={`${session.type}-${session.duration}`} className="rounded-xl bg-muted/40 p-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-foreground">{session.type}</p>
                                    <p className="text-sm text-muted-foreground">{session.duration}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {session.calories} • Avg pace/speed: {session.pace}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-card rounded-2xl p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Clock3 className="h-5 w-5 text-sky" />
                        AI Insight Brief
                    </h2>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Priority signal: {stressIndex > 55 ? 'Stress regulation' : 'Consistency stacking'} for the next 24 hours.
                        </p>
                        <p>
                            Biggest leverage action: {planCompletion < 40 ? 'Complete 1 weekly-plan task tonight.' : 'Keep momentum with short recovery blocks.'}
                        </p>
                        <p>
                            Burnout early-warning: {stressIndex > 70 ? 'Elevated. Reduce cognitive load tomorrow morning.' : 'Low-to-moderate. Maintain your current rhythm.'}
                        </p>
                    </div>
                </section>

                <section className="bg-card rounded-2xl p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-coral" />
                        Important Limitations
                    </h2>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Health Connect requires explicit user consent for each data type.</p>
                        <p>Sleep, oxygen, and heart metrics depend on your watch model and source app settings.</p>
                        <p>ECG and advanced cardiac signals may be restricted by device, region, or platform policy.</p>
                        <p>Background syncing and available metrics vary by wearable, phone, and user settings.</p>
                        <p>
                            Best wellness signal blend: sleep quality + HRV + activity + stress for mood, burnout,
                            and recommendation engines.
                        </p>
                    </div>
                </section>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                        <Brain className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">Mental Wellness Alignment</h3>
                    <p className="text-sm text-muted-foreground">
                        This insight model supports mood prediction, stress detection, burnout warnings, and
                        personalized wellness recommendations.
                    </p>
                </motion.div>
            </main>

            <BottomNav />
        </div>
    );
};

export default Insights;
