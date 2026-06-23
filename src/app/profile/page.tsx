'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useRooms } from '@/hooks/useRooms';
import { signOut } from '@/services/authService';
import { updateUserProfile, uploadProfilePicture } from '@/services/userService';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import styles from './page.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, reset: resetAuth, isAuthenticated, isLoading } = useAuthStore();
  const { rooms } = useRooms();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setEditUsername(user.username);
    }
  }, [user]);

  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      const downloadURL = await uploadProfilePicture(user.uid, objectUrl);
      updateProfile({ photoURL: downloadURL });
    } catch (error) {
      alert('Could not upload profile picture.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveUsername = async () => {
    if (!editUsername.trim()) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, { username: editUsername.trim() });
      updateProfile({ username: editUsername.trim() });
      setIsEditing(false);
    } catch (error) {
      alert('Could not update username.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      resetAuth();
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.scrollContent}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerLabel}>PROFILE</span>
          <h1 className={styles.headerTitle}>Your Account</h1>
        </div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className={styles.avatarSection}
        >
          <button 
            className={styles.avatarButton} 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Avatar uri={user.photoURL} name={user.username} size={100} showBorder />
            <div className={styles.editAvatarBadge}>
              <span className={styles.editAvatarText}>{isUploading ? '...' : '✎'}</span>
            </div>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
        </motion.div>

        {/* Username Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          {isEditing ? (
            <div className={styles.editSection}>
              <Input
                label="USERNAME"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
              />
              <div className={styles.editActions}>
                <Button
                  title="Cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setEditUsername(user.username);
                  }}
                  variant="ghost"
                  size="sm"
                />
                <Button
                  title="Save"
                  onClick={handleSaveUsername}
                  variant="primary"
                  size="sm"
                  loading={isSaving}
                />
              </div>
            </div>
          ) : (
            <button
              className={styles.usernameSection}
              onClick={() => setIsEditing(true)}
            >
              <h2 className={styles.username}>{user.username}</h2>
              <span className={styles.editHint}>Tap to edit</span>
            </button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className={styles.statsContainer}
        >
          <GlassCard accent className={styles.statsCard}>
            <div className={styles.statRow}>
              <div className={styles.stat}>
                <AnimatedNumber value={user.auraBalance} className={styles.statValue} />
                <span className={styles.statLabel}>AURA BALANCE</span>
              </div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statRow}>
              <div className={styles.stat}>
                <span className={styles.statValueText}>{rooms.length}</span>
                <span className={styles.statLabel}>ROOMS JOINED</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Email Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.4 }}
          className={styles.infoContainer}
        >
          <GlassCard className={styles.infoCard}>
            <span className={styles.infoLabel}>EMAIL</span>
            <span className={styles.infoValue}>{user.email}</span>
          </GlassCard>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.5 }}
          className={styles.signOutContainer}
        >
          <Button
            title="Sign Out"
            onClick={handleSignOut}
            variant="secondary"
            size="lg"
            fullWidth
            className={styles.signOutButton}
          />
        </motion.div>

        {/* Version */}
        <div className={styles.versionContainer}>
          <span className={styles.version}>Aura v1.0.0</span>
        </div>
      </main>
    </div>
  );
}
