import { useEffect } from 'react';

export function useOldAndroidScrollFix() {
  useEffect(() => {
    // Only run on the client
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // Check for Android and extract version
    const match = userAgent.match(/Android\s([0-9\.]*)/i);
    
    if (match) {
      const version = parseFloat(match[1]);
      if (version <= 12) {
        document.body.classList.add('old-android-scroll-fix');
      }
    }
  }, []);
}
