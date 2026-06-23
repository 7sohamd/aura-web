'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createRoom } from '@/services/roomService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthenticated, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !user) return;

    setIsLoading(true);
    try {
      const room = await createRoom(
        user.uid,
        roomName.trim(),
        user.username,
        user.photoURL,
        user.auraBalance
      );
      router.push(`/room/${room.roomId}`);
    } catch (error: any) {
      console.error('Create room error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
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
          <h1 className={styles.title}>Create a Room</h1>
          <p className={styles.subtitle}>
            Start a new group and invite your friends.
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          onSubmit={handleCreate}
          className={styles.form}
        >
          <Input
            label="Room Name"
            placeholder="e.g. The Inner Circle"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            maxLength={30}
          />
          <div className={styles.actions}>
            <Button
              type="submit"
              title="Create Room"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!roomName.trim() || isLoading}
            />
          </div>
        </motion.form>
      </div>
    </div>
  );
}
