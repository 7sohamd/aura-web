'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { joinRoom } from '@/services/roomService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function JoinRoomPage() {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthenticated, router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !user) return;

    setIsLoading(true);
    try {
      const room = await joinRoom(
        roomId.trim(),
        user.uid,
        user.username,
        user.photoURL,
        user.auraBalance
      );
      router.push(`/room/${room.roomId}`);
    } catch (error: any) {
      console.error('Join room error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.glowCircle}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={styles.content}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring' }}
          className={styles.header}
        >
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.title}>Join a Room</h1>
          <p className={styles.subtitle}>
            Enter the room code to join your friends.
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          onSubmit={handleJoin}
          className={styles.form}
        >
          <Input
            label="Room Code"
            placeholder="e.g. X7K9A2"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            required
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
          />
          <div className={styles.actions}>
            <Button
              type="submit"
              title="Join Room"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!roomId.trim() || isLoading}
            />
          </div>
        </motion.form>
      </div>
    </div>
  );
}
