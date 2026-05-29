import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  MessageCircle, 
  Database, 
  Trash2,
  Lock,
  Download
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

interface PrivacySettingsProps {
  onClose: () => void;
}

export const PrivacySettings = ({ onClose }: PrivacySettingsProps) => {
  const { privacy, updatePrivacy } = useSettingsStore();

  const handleExportData = () => {
    // Create a sample export of user data
    const exportData = {
      exportDate: new Date().toISOString(),
      message: 'Your wellness data export',
      settings: privacy,
    };
    
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
    {
      id: 'shareAnonymousData',
      icon: <Database className="h-5 w-5" />,
      label: 'Share Anonymous Data',
      description: 'Help improve the app with anonymous usage data',
      value: privacy.shareAnonymousData,
      color: 'text-sage bg-sage-light',
    },
    {
      id: 'showProfileInPeerChat',
      icon: <Eye className="h-5 w-5" />,
      label: 'Show Profile in Peer Chat',
      description: 'Let others see your basic profile info',
      value: privacy.showProfileInPeerChat,
      color: 'text-coral bg-coral-light',
    },
    {
      id: 'allowDirectMessages',
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Allow Direct Messages',
      description: 'Let peer supporters message you first',
      value: privacy.allowDirectMessages,
      color: 'text-sky bg-sky-light',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Privacy & Security</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-sage/20 to-sage-light/50 rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center">
              <Lock className="h-7 w-7 text-sage" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Your Data is Protected</h2>
              <p className="text-sm text-muted-foreground">
                All your data is stored securely on your device
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Privacy Controls
          </h3>
          {privacyItems.map((item, index) => (
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
                  updatePrivacy({ [item.id]: checked })
                }
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Data Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-honey-light flex items-center justify-center">
              <Database className="h-6 w-6 text-honey" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Data Retention</h3>
              <p className="text-sm text-muted-foreground">
                How long to keep your data
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {[30, 90, 180, 365].map((days) => (
              <Button
                key={days}
                size="sm"
                variant={privacy.dataRetentionDays === days ? 'default' : 'outline'}
                className={privacy.dataRetentionDays === days 
                  ? 'bg-sage hover:bg-sage/90 text-white' 
                  : ''
                }
                onClick={() => updatePrivacy({ dataRetentionDays: days })}
              >
                {days === 365 ? '1 Year' : `${days} Days`}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Data Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your Data
          </h3>
          
          <Button
            variant="outline"
            onClick={handleExportData}
            className="w-full justify-start gap-3 py-6 rounded-xl"
          >
            <Download className="h-5 w-5 text-sage" />
            <div className="text-left">
              <p className="font-medium">Export My Data</p>
              <p className="text-xs text-muted-foreground">
                Download a copy of your data
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleDeleteData}
            className="w-full justify-start gap-3 py-6 rounded-xl border-destructive/50 hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5 text-destructive" />
            <div className="text-left">
              <p className="font-medium text-destructive">Delete All Data</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove all your data
              </p>
            </div>
          </Button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-sage-light/50 rounded-2xl p-5"
        >
          <h3 className="font-medium text-foreground mb-2">🔒 Privacy First</h3>
          <p className="text-sm text-muted-foreground">
            WellMind stores all your data locally on your device. We never upload 
            your personal information to any server. Your mental health journey 
            is completely private.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacySettings;
