import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zami.wellmind',
  appName: 'WellMind',
  webDir: 'dist',
  android: {
    backgroundColor: '#ffffff',  // optional: splash background
    icon: 'android/public/logo.png' 
  }
};

export default config;
