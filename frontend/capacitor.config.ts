import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cinecatch.app',
  appName: 'Cine Catch',
  webDir: 'build',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['*.kakao.com', '*.daumcdn.net']
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
