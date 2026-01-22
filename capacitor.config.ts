import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.antigravity.finapp',
  appName: 'FinApp',
  webDir: 'out',

  // Server configuration
  server: {
    androidScheme: 'https',
    // For development, you can set this to your local dev server
    // url: 'http://192.168.1.x:3000',
    // cleartext: true
  },

  // Android-specific settings
  android: {
    backgroundColor: '#0f172a',
    allowMixedContent: false,
    useLegacyBridge: false
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;

