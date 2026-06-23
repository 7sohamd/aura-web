'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useAuthStore } from '@/stores/authStore';
import styles from './BottomNav.module.css';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isInstallable, promptInstall } = usePWAInstall();
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [device, setDevice] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setDevice('ios');
    } else if (/android/.test(ua)) {
      setDevice('android');
    } else {
      setDevice('other');
    }
  }, []);

  // Do not show bottom nav on sign-in page
  if (!isAuthenticated || pathname === '/sign-in') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      setShowInstallHelp(true);
    }
  };

  return (
    <>
      <div className={styles.navContainer}>
        <button
          className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}
          onClick={() => router.push('/')}
        >
          <span className={styles.icon}>◆</span>
          <span className={styles.label}>Home</span>
        </button>

        <button className={styles.navItemInstall} onClick={handleInstallClick}>
          <span className={styles.installIcon}>↓</span>
          <span className={styles.labelInstall}>Install</span>
        </button>

        <button
          className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`}
          onClick={() => router.push('/profile')}
        >
          <span className={styles.icon}>☺</span>
          <span className={styles.label}>Profile</span>
        </button>
      </div>

      <AnimatePresence>
        {showInstallHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={() => setShowInstallHelp(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Install Aura</h3>
              <p className={styles.modalText}>
                To install this app on your device:
              </p>
              <ul className={styles.modalList}>
                {device === 'ios' && (
                  <li>Tap the <strong>Share</strong> button at the bottom of the screen and select <strong>Add to Home Screen</strong>.</li>
                )}
                {device === 'android' && (
                  <li>Tap the browser menu (⋮) and select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
                )}
                {device === 'other' && (
                  <>
                    <li><strong>iOS:</strong> Tap the <strong>Share</strong> button and select <strong>Add to Home Screen</strong>.</li>
                    <li><strong>Android / PC:</strong> Tap the browser menu (⋮) and select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
                  </>
                )}
              </ul>
              <button className={styles.modalClose} onClick={() => setShowInstallHelp(false)}>
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
