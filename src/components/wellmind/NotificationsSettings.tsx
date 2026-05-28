import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Bell, Clock, Flame, BarChart3, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

interface NotificationsSettingsProps {
  onClose: () => void;
}

export const NotificationsSettings = ({ onClose }: NotificationsSettingsProps) => {
  const { notifications, updateNotifications } = useSettingsStore();

  const handleSave = () => {
    toast.success('Notification settings saved!');
  };

  const settingsItems = [
    {
      id: 'dailyReminder',
      icon: <Bell className="h-5 w-5" />,
      label: 'Daily Reminder',
      description: 'Get reminded to check in with your mood',
      value: notifications.dailyReminder,
      color: 'text-coral bg-coral-light',
    },
    {
      id: 'moodCheckReminder',
      icon: <Clock className="h-5 w-5" />,
      label: 'Mood Check Reminder',
      description: 'Gentle nudge if you haven\'t logged today',
      value: notifications.moodCheckReminder,
      color: 'text-sage bg-sage-light',
    },
    {
      id: 'streakReminder',
      icon: <Flame className="h-5 w-5" />,
      label: 'Streak Reminder',
      description: 'Don\'t lose your streak! Get notified',
      value: notifications.streakReminder,
      color: 'text-honey bg-honey-light',
    },
    {
      id: 'weeklyReport',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Weekly Report',
      description: 'Summary of your wellness journey',
      value: notifications.weeklyReport,
      color: 'text-sky bg-sky-light',
    },
    {
      id: 'motivationalMessages',
      icon: <Sparkles className="h-5 w-5" />,
      label: 'Motivational Messages',
      description: 'Uplifting quotes throughout the day',
      value: notifications.motivationalMessages,
      color: 'text-lavender bg-lavender-light',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Reminder Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-coral-light flex items-center justify-center">
              <Clock className="h-6 w-6 text-coral" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Daily Reminder Time</h2>
              <p className="text-sm text-muted-foreground">
                When should we remind you?
              </p>
            </div>
          </div>
          <Input
            type="time"
            value={notifications.reminderTime}
            onChange={(e) => updateNotifications({ reminderTime: e.target.value })}
            className="bg-background"
          />
        </motion.div>

        {/* Toggle Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {settingsItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-soft flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={item.value}
                onCheckedChange={(checked) => 
                  updateNotifications({ [item.id]: checked })
                }
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sage-light/50 rounded-2xl p-5"
        >
          <h3 className="font-medium text-foreground mb-2">💡 Tip</h3>
          <p className="text-sm text-muted-foreground">
            Consistent reminders help build healthy habits. Choose a time when you're 
            most likely to have a quiet moment for reflection.
          </p>
        </motion.div>

        <Button
          onClick={handleSave}
          className="w-full py-6 rounded-2xl bg-sage hover:bg-sage/90 text-white"
        >
          Save Settings
        </Button>
      </main>
    </div>
  );
};

export default NotificationsSettings;
