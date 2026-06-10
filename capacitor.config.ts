import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zami.wellmind',
  appName: 'WellMind',
  webDir: 'dist',
  plugins: {
    Camera: {
      // Runtime Android permissions for camera/microphone are declared in android/app/src/main/AndroidManifest.xml
    },
  },
};

export default config;
