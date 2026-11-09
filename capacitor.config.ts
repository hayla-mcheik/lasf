import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'info.lasf.app',
  appName: 'lasf',
webDir: '.output/public',
  ios: {
    contentInset: 'always',        // keeps the web view below the status bar and above the home indicator
    backgroundColor: '#ffffff'     // colour of the strip behind the status bar
  }
};

export default config;
