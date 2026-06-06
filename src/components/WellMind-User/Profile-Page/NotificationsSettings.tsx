import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, Clock, Flame, BarChart3, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

interface NotificationsSettingsProps {
  onClose: () => void;
}

export const NotificationsSettings = ({ onClose }: NotificationsSettingsProps) => {
  const { notifications, updateNotifications } = useSettingsStore();

  const settingsItems = [
    { id: 'dailyReminder',        icon: <Bell className="h-5 w-5" />,     label: 'Daily Reminder',        description: 'Get reminded to check in with your mood',          value: notifications.dailyReminder,        color: 'bg-coral-light',    iconColor: 'text-coral' },
    { id: 'moodCheckReminder',    icon: <Clock className="h-5 w-5" />,    label: 'Mood Check Reminder',   description: 'Gentle nudge if you haven\'t logged today',         value: notifications.moodCheckReminder,    color: 'bg-sage-light',     iconColor: 'text-sage' },
    { id: 'streakReminder',       icon: <Flame className="h-5 w-5" />,    label: 'Streak Reminder',       description: 'Don\'t lose your streak! Get notified',            value: notifications.streakReminder,       color: 'bg-honey-light',    iconColor: 'text-honey' },
    { id: 'weeklyReport',         icon: <BarChart3 className="h-5 w-5" />,label: 'Weekly Report',         description: 'Summary of your wellness journey each week',       value: notifications.weeklyReport,         color: 'bg-sky-light',      iconColor: 'text-sky' },
    { id: 'motivationalMessages', icon: <Sparkles className="h-5 w-5" />, label: 'Motivational Messages', description: 'Uplifting quotes and encouragement through the day', value: notifications.motivationalMessages, color: 'bg-lavender-light', iconColor: 'text-lavender' },
  ];

  return (
    <div className="min-h-screen bg-background pb-10">

      {/* Header */}
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem]">
        <div className="pt-6">
          <Button variant="ghost" size="icon" onClick={onClose} className="mb-2 -ml-2 text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-coral" />
              Notifications
            </h1>
            <p className="text-muted-foreground">Manage your reminders and alerts</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">

        {/* Reminder time picker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-4 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-coral" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Daily Reminder Time</p>
              <p className="text-xs text-muted-foreground">When should we check in with you?</p>
            </div>
          </div>
          <input
            type="time"
            value={notifications.reminderTime}
            onChange={(e) => updateNotifications({ reminderTime: e.target.value })}
            className="w-full px-4 py-3 bg-muted rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </motion.div>

        {/* Toggle items */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Notification Types
          </p>
          <div className="bg-card rounded-2xl shadow-soft overflow-hidden divide-y divide-border">
            {settingsItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + index * 0.06 }}
                className="flex items-center gap-3 px-4 py-4"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} ${item.iconColor} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={(checked) => updateNotifications({ [item.id]: checked })}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tip card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-lavender-light rounded-2xl p-4 flex items-start gap-3"
        >
          <Sparkles className="h-4 w-4 text-lavender shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed">
            Consistent reminders help build healthy habits. Pick a time when you usually have a quiet moment to reflect. 💚
          </p>
        </motion.div>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => toast.success('Notification settings saved!')}
            className="w-full py-5 rounded-2xl"
            variant="sage"
          >
            Save Settings
          </Button>
        </motion.div>

      </main>
    </div>
  );
};

export default NotificationsSettings;