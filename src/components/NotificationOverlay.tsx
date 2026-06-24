'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import {
  AuraNotification,
  subscribeToUnreadNotifications,
  subscribeToRecentNotifications,
  markAsRead,
  markAllAsRead
} from '@/services/notificationService';
import styles from './NotificationOverlay.module.css';

export function NotificationOverlay() {
  const user = useAuthStore((state) => state.user);
  
  const [unreadNotifications, setUnreadNotifications] = useState<AuraNotification[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<AuraNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // For the initial popup sequence
  const [popupQueue, setPopupQueue] = useState<AuraNotification[]>([]);
  const [isDismissingAll, setIsDismissingAll] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Listen to unread to populate the badge and the popup queue
    const unsubscribeUnread = subscribeToUnreadNotifications(user.uid, (notifications) => {
      setUnreadNotifications(notifications);
      
      // If we just loaded and there are unread notifications, populate the popup queue
      setPopupQueue((currentQueue) => {
        // Only add to queue if it's new (to prevent infinite loops)
        const newNotifs = notifications.filter(
          n => !currentQueue.find(q => q.id === n.id)
        );
        return [...currentQueue, ...newNotifs];
      });
    });

    // Listen to recent for the dropdown history
    const unsubscribeRecent = subscribeToRecentNotifications(user.uid, 20, (notifications) => {
      setRecentNotifications(notifications);
    });

    return () => {
      unsubscribeUnread();
      unsubscribeRecent();
    };
  }, [user?.uid]);

  const handleSkip = async (notificationId: string) => {
    if (!user?.uid) return;
    setPopupQueue(prev => prev.filter(n => n.id !== notificationId));
    await markAsRead(user.uid, notificationId);
  };

  const handleDismissAll = async () => {
    if (!user?.uid) return;
    setIsDismissingAll(true);
    
    const idsToMark = popupQueue.map(n => n.id!);
    
    // Animate out
    setTimeout(async () => {
      setPopupQueue([]);
      setIsDismissingAll(false);
      await markAllAsRead(user.uid, idsToMark);
    }, 400); // Wait for animation
  };

  const markDropdownAllRead = async () => {
    if (!user?.uid) return;
    const ids = unreadNotifications.map(n => n.id!);
    await markAllAsRead(user.uid, ids);
  };

  if (!user) return null;

  return (
    <>
      {/* Top Right Bell & Dropdown */}
      <div className={styles.overlayContainer}>
        <button 
          className={styles.bellButton} 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Bell size={24} />
          {unreadNotifications.length > 0 && (
            <span className={styles.badge}>{unreadNotifications.length}</span>
          )}
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className={styles.dropdown}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.dropdownHeader}>
                Notifications
                {unreadNotifications.length > 0 && (
                  <button className={styles.markAllBtn} onClick={markDropdownAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              
              {recentNotifications.length === 0 ? (
                <div className={styles.emptyState}>No recent notifications.</div>
              ) : (
                recentNotifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`${styles.notificationItem} ${!notif.isRead ? styles.unread : ''}`}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(user.uid!, notif.id!);
                    }}
                  >
                    <div style={{ marginTop: '2px' }}><Sparkles size={16} color="var(--primary)" /></div>
                    <div className={styles.notificationContent}>
                      <span className={styles.notificationText}>
                        You received <strong>{notif.amount} Aura</strong> from @{notif.senderUsername}
                      </span>
                      {notif.comment && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          "{notif.comment}"
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popup Cards Stack */}
      <AnimatePresence>
        {popupQueue.length > 0 && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.cardStackContainer}>
              <AnimatePresence>
                {popupQueue.map((notif, index) => {
                  // Display only the top 3 visually for performance and look
                  if (index > 2) return null;
                  
                  const isTop = index === 0;
                  // If dismissing all, swipe them all down/away
                  const exitAnimation = isDismissingAll 
                    ? { y: 300, opacity: 0, scale: 0.8, rotate: Math.random() * 20 - 10 } 
                    : { x: -300, opacity: 0, rotate: -15 };

                  return (
                    <motion.div
                      key={notif.id}
                      className={styles.popupCard}
                      style={{ 
                        zIndex: 100 - index,
                      }}
                      initial={{ scale: 0.8, y: 50, opacity: 0 }}
                      animate={{ 
                        scale: 1 - index * 0.05, 
                        y: index * -20, 
                        opacity: 1 - index * 0.2 
                      }}
                      exit={exitAnimation}
                      transition={{ duration: 0.3 }}
                    >
                      <Sparkles size={48} className={styles.sparkleIcon} />
                      <h2 className={styles.cardTitle}>Aura Received!</h2>
                      <p className={styles.cardBody}>
                        <span className={styles.amountHighlight}>{notif.amount} Aura</span>
                        <br />
                        from @{notif.senderUsername}
                        {notif.roomName && ` in ${notif.roomName}`}
                      </p>
                      {notif.comment && (
                        <p style={{ fontStyle: 'italic', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                          "{notif.comment}"
                        </p>
                      )}
                      
                      {isTop && (
                        <button 
                          className={styles.skipBtn} 
                          onClick={() => handleSkip(notif.id!)}
                        >
                          Awesome! (Skip)
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Dismiss All Cross */}
              <motion.div 
                className={styles.dismissAllContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button className={styles.dismissAllBtn} onClick={handleDismissAll}>
                  <X size={24} />
                </button>
                <span className={styles.dismissAllText}>Dismiss All</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
