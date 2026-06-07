import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, Clock, Flame, BarChart3, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

interface NotificationsSettingsProps {
  onClose: () => void;
}

export const NotificationsSettings = ({ onClose }: NotificationsSettingsProps) => {
  const { notifications, updateNotifications } = useSettingsStore();

  const settingsItems: {
    id: string;
    icon: React.ElementType;
    label: string;
    description: string;
    value: boolean;
    accent: string;
    accentBg: string;
  }[] = [
    {
      id: 'dailyReminder',
      icon: Bell,
      label: 'Daily Reminder',
      description: 'Get reminded to check in with your mood',
      value: notifications.dailyReminder,
      accent: '#e8735a',
      accentBg: 'rgba(232,115,90,0.1)',
    },
    {
      id: 'moodCheckReminder',
      icon: Clock,
      label: 'Mood Check Reminder',
      description: "Gentle nudge if you haven't logged today",
      value: notifications.moodCheckReminder,
      accent: '#39a89b',
      accentBg: 'rgba(57,168,155,0.1)',
    },
    {
      id: 'streakReminder',
      icon: Flame,
      label: 'Streak Reminder',
      description: "Don't lose your streak! Get notified",
      value: notifications.streakReminder,
      accent: '#d97706',
      accentBg: 'rgba(251,191,36,0.12)',
    },
    {
      id: 'weeklyReport',
      icon: BarChart3,
      label: 'Weekly Report',
      description: 'Summary of your wellness journey each week',
      value: notifications.weeklyReport,
      accent: '#3b82f6',
      accentBg: 'rgba(59,130,246,0.1)',
    },
    {
      id: 'motivationalMessages',
      icon: Sparkles,
      label: 'Motivational Messages',
      description: 'Uplifting quotes and encouragement through the day',
      value: notifications.motivationalMessages,
      accent: '#7c6fa0',
      accentBg: 'rgba(124,111,160,0.1)',
    },
  ];

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-5 py-3.5"
        style={{
          background: 'rgba(240,247,245,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.15)',
          paddingTop: 'max(env(safe-area-inset-top), 14px)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              }}
            >
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Notifications</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Manage your reminders and alerts
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-8 pb-6"
      >
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2
            className="text-[1.75rem] font-bold leading-tight mb-1.5"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Stay on{'\n'}track.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Choose when and how we reach out to you.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Reminder time card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #e8735a, #e8735a88)' }}
          />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,115,90,0.1)' }}
              >
                <Clock className="h-5 w-5" style={{ color: '#e8735a' }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Daily Reminder Time</p>
                <p className="text-[11px]" style={{ color: '#8fa3b1' }}>When should we check in with you?</p>
              </div>
            </div>

            <div
              className="h-px w-full mb-3"
              style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
            />

            <input
              type="time"
              value={notifications.reminderTime}
              onChange={(e) => updateNotifications({ reminderTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(57,168,155,0.06)',
                color: '#1a2b38',
                border: '1px solid rgba(57,168,155,0.15)',
              }}
            />
          </div>
        </motion.div>

        {/* ── Toggle items ── */}
        <section className="space-y-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1"
            style={{ color: '#8fa3b1' }}
          >
            Notification Types
          </p>

          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${item.accent}, ${item.accent}88)` }}
                />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.accentBg }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.accent }} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug" style={{ color: '#1a2b38' }}>{item.label}</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#8fa3b1' }}>{item.description}</p>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={(checked) => updateNotifications({ [item.id]: checked })}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ── Tip card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #7c6fa0, #7c6fa088)' }}
          />
          <div className="p-4 flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(124,111,160,0.1)' }}
            >
              <Sparkles className="h-4 w-4" style={{ color: '#7c6fa0' }} strokeWidth={1.75} />
            </div>
            <p className="text-xs leading-relaxed pt-1" style={{ color: '#5f7585' }}>
              Consistent reminders help build healthy habits. Pick a time when you usually have a quiet moment to reflect. 💚
            </p>
          </div>
        </motion.div>

        {/* ── Save button ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 280, damping: 26 }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => toast.success('Notification settings saved!')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
              boxShadow: '0 4px 16px rgba(57,168,155,0.35)',
            }}
          >
            <Bell className="h-4 w-4" />
            Save Settings
          </motion.button>
        </motion.div>

      </main>
    </div>
  );
};

export default NotificationsSettings;