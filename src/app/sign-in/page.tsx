'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const GlowBackground = dynamic(() => import('@/components/GlowBackground'), {
  ssr: false,
});
import { signInWithGooglePopup, signInGuest } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setShowWelcome } = useAuthStore();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { auraUser, isNew } = await signInWithGooglePopup();
      
      setUser(auraUser);
      if (isNew) setShowWelcome(true);
      
      router.push('/');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      const { auraUser, isNew } = await signInGuest();
      
      setUser(auraUser);
      if (isNew) setShowWelcome(true);
      
      router.push('/');
    } catch (error: any) {
      console.error('Guest sign-in error:', error);
      alert(error.message || 'Could not sign in as guest.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated Glow Background */}
      <GlowBackground className1={styles.glowCircle} className2={styles.glowCircle2} />

      <div className={styles.content}>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className={styles.header}
        >
          <span className={styles.brandLabel}>✦ AURA</span>
          <h1 className={styles.title}>Welcome to<br/>Aura</h1>
          <p className={styles.subtitle}>
            Transfer social energy.<br/>Build your ranking.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.6 }}
          className={styles.actions}
        >
          <Button
            title="Continue with Google"
            onClick={handleGoogleSignIn}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            icon={<span className={styles.googleIcon}>G</span>}
          />
          
          <Button
            title="Continue as Guest"
            onClick={handleGuestSignIn}
            variant="secondary"
            size="lg"
            fullWidth
            loading={isLoading}
          />

          <p className={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
