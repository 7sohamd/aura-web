'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useRooms } from '@/hooks/useRooms';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoomCard } from '@/components/RoomCard';
import type { Room } from '@/services/roomService';
import styles from './page.module.css';

function CTACard({
  title,
  subtitle,
  icon,
  onClick,
  delay,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', delay, stiffness: 300, damping: 20 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={styles.ctaCard}
    >
      <span className={styles.ctaIcon}>{icon}</span>
      <span className={styles.ctaTitle}>{title}</span>
      <span className={styles.ctaSubtitle}>{subtitle}</span>
    </motion.button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { rooms, isLoadingRooms } = useRooms();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleRoomPress = (room: Room) => {
    router.push(`/room/${room.roomId}`);
  };

  if (isLoading || !isAuthenticated) {
    return null; // Don't render until authenticated (avoids flicker before redirect)
  }

  return (
    <div className={styles.container}>
      <main className={styles.scrollContent}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <motion.div
            className={styles.heroGlow}
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <span className={styles.brandLabel}>✦ AURA</span>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <div className={styles.titleContainer}>
              <h1 className={styles.heroTitle}>Aura</h1>
              <span className={styles.builtByLabel}>built by Soham</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            <p className={styles.heroSubtitle}>
              Transfer social energy.<br />Build your ranking.
            </p>
          </motion.div>

          {/* Balance Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
          >
            <GlassCard accent className={styles.balanceCard}>
              <span className={styles.balanceLabel}>YOUR AURA BALANCE</span>
              <AnimatedNumber
                value={user?.auraBalance || 0}
                className={styles.balanceValue}
              />
              <span className={styles.balanceUnit}>AURA POINTS</span>
            </GlassCard>
          </motion.div>
        </section>

        {/* CTA Cards */}
        <section className={styles.ctaRow}>
          <CTACard
            title="Create Room"
            subtitle="Start a new group"
            icon="✦"
            onClick={() => router.push('/room/create')}
            delay={0.5}
          />
          <CTACard
            title="Join Room"
            subtitle="Enter with code"
            icon="→"
            onClick={() => router.push('/room/join')}
            delay={0.6}
          />
        </section>

        {/* Rooms List */}
        <section className={styles.roomsSection}>
          <h2 className={styles.sectionLabel}>YOUR ROOMS</h2>

          {rooms.length === 0 && !isLoadingRooms ? (
            <EmptyState
              title="No Aura Rooms Yet"
              subtitle="Create your first room and invite friends to start exchanging Aura."
              icon="◆"
            />
          ) : (
            <div className={styles.roomsList}>
              {rooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  onPress={handleRoomPress}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
