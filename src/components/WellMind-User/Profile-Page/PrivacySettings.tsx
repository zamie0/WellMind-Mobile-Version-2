import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, Shield, Eye, MessageCircle, 
  Database, Trash2, Lock, Download
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

interface PrivacySettingsProps {
  onClose: () => void;
}

export const PrivacySettings = ({ onClose }: PrivacySettingsProps) => {
  const { privacy, updatePrivacy } = useSettingsStore();

  const handleExportData = () => {
    const exportData = { exportDate: new Date().toISOString(), message: 'Your wellness data export', settings: privacy };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wellmind-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleDeleteData = () => {
    toast.info('Data deletion requested', {
      description: 'This would delete all your data. For demo purposes, this is disabled.',
    });
  };

  const privacyItems = [
    { id: 'shareAnonymousData',         icon: <Database className="h-5 w-5" />,      label: 'Share Anonymous Data',              description: 'Help improve the app with anonymous usage data',  value: privacy.shareAnonymousData,              color: 'bg-sage-light',    iconColor: 'text-sage' },
    { id: 'showProfileInCounselorChat', icon: <Eye className="h-5 w-5" />,           label: 'Show Profile in Counselor Chat',    description: 'Let others see your basic profile info',          value: privacy.showProfileInCounselorChat,      color: 'bg-coral-light',   iconColor: 'text-coral' },
    { id: 'allowDirectMessages',        icon: <MessageCircle className="h-5 w-5" />, label: 'Allow Direct Messages',             description: 'Let counselor supporters message you first',      value: privacy.allowDirectMessages,             color: 'bg-sky-light',     iconColor: 'text-sky' },
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
              <Shield className="h-6 w-6 text-sky" />
              Privacy & Security
            </h1>
            <p className="text-muted-foreground">Control your data and privacy</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-5">

        {/* Protected banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-sage-light rounded-2xl p-4 shadow-soft flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-card/60 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-sage" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Your Data is Protected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All data is stored locally on your device — never uploaded
            </p>
          </div>
        </motion.div>

        {/* Privacy Toggles */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Privacy Controls
          </p>
          <div className="bg-card rounded-2xl shadow-soft overflow-hidden divide-y divide-border">
            {privacyItems.map((item, index) => (
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
                  onCheckedChange={(checked) => updatePrivacy({ [item.id]: checked })}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Data Retention */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Data Retention
          </p>
          <div className="bg-card rounded-2xl p-4 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-honey-light flex items-center justify-center shrink-0">
                <Database className="h-5 w-5 text-honey" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">How long to keep your data</p>
                <p className="text-xs text-muted-foreground">Older entries will be removed automatically</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[30, 90, 180, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => updatePrivacy({ dataRetentionDays: days })}
                  className={`py-2 rounded-xl text-xs font-medium transition-all ${
                    privacy.dataRetentionDays === days
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {days === 365 ? '1 Year' : `${days}d`}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Data Actions */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Your Data
          </p>
          <div className="space-y-2">
            <button
              onClick={handleExportData}
              className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3 hover:shadow-card transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-sage" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Export My Data</p>
                <p className="text-xs text-muted-foreground">Download a copy of your data</p>
              </div>
            </button>

            <button
              onClick={handleDeleteData}
              className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3 hover:shadow-card transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Delete All Data</p>
                <p className="text-xs text-muted-foreground">Permanently remove all your data</p>
              </div>
            </button>
          </div>
        </motion.section>

      </main>
    </div>
  );
};

export default PrivacySettings;