import { toast } from 'sonner';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWellMindStore } from '@/stores/wellmindStore';

const LAST_KEY = 'wellmind-last-notify';

interface LastNotify {
  dailyReminder?: string;
  moodCheckReminder?: string;
  streakReminder?: string;
  weeklyReport?: string;
  motivationalMessages?: string;
}

const MOTIVATIONS = [
  'You are doing better than you think 💚',
  'Small steps still move you forward 🌱',
  'Be kind to yourself today ✨',
  'Your feelings are valid 🌿',
  'Take a deep breath — you got this 🌸',
];

const getLast = (): LastNotify => {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) || '{}'); } catch { return {}; }
};
const setLast = (v: LastNotify) => localStorage.setItem(LAST_KEY, JSON.stringify(v));

const todayKey = () => new Date().toISOString().slice(0, 10);
const weekKey = () => {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

let timer: number | null = null;

export const startNotificationScheduler = () => {
  if (timer !== null) return;

  const tick = () => {
    const { notifications } = useSettingsStore.getState();
    const { moodEntries, currentStreak } = useWellMindStore.getState();
    const last = getLast();
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = todayKey();

    // Daily reminder at chosen time
    if (notifications.dailyReminder && hhmm === notifications.reminderTime && last.dailyReminder !== today) {
      toast('🌿 Daily wellness reminder', { description: 'Take a moment to check in with yourself.' });
      last.dailyReminder = today;
    }

    // Mood check reminder if no entry today, after 6pm
    if (notifications.moodCheckReminder && now.getHours() >= 18 && last.moodCheckReminder !== today) {
      const hasToday = moodEntries.some((m) => new Date(m.timestamp).toDateString() === now.toDateString());
      if (!hasToday) {
        toast('💭 How are you feeling today?', { description: "You haven't logged your mood yet." });
        last.moodCheckReminder = today;
      }
    }

    // Streak reminder if streak > 0 and no entry today, after 8pm
    if (notifications.streakReminder && currentStreak > 0 && now.getHours() >= 20 && last.streakReminder !== today) {
      const hasToday = moodEntries.some((m) => new Date(m.timestamp).toDateString() === now.toDateString());
      if (!hasToday) {
        toast(`🔥 Don't break your ${currentStreak}-day streak!`, { description: 'Quick check-in keeps it alive.' });
        last.streakReminder = today;
      }
    }

    // Weekly report on Sunday after 6pm
    if (notifications.weeklyReport && now.getDay() === 0 && now.getHours() >= 18 && last.weeklyReport !== weekKey()) {
      const weekEntries = moodEntries.filter((m) => {
        const d = new Date(m.timestamp);
        return (now.getTime() - d.getTime()) <= 7 * 86400000;
      });
      toast('📊 Your weekly wellness report', { description: `${weekEntries.length} check-ins this week. Keep going!` });
      last.weeklyReport = weekKey();
    }

    // Motivational messages once per day at 10am
    if (notifications.motivationalMessages && hhmm === '10:00' && last.motivationalMessages !== today) {
      const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
      toast(msg);
      last.motivationalMessages = today;
    }

    setLast(last);
  };

  tick();
  timer = window.setInterval(tick, 60000);
};

export const stopNotificationScheduler = () => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
};
