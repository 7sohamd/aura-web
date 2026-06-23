'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './RoomCard.module.css';
import type { Room } from '@/services/roomService';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

export function RoomCard({ room, onPress }: RoomCardProps) {
  return (
    <motion.button
      className={styles.card}
      onClick={() => onPress(room)}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
    >
      <div className={styles.header}>
        <h3 className={styles.name}>{room.roomName}</h3>
        <p className={styles.roomId}>{room.roomId}</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{room.memberCount}</span>
          <span className={styles.statLabel}>MEMBERS</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>→</span>
          <span className={styles.statLabel}>ENTER</span>
        </div>
      </div>
    </motion.button>
  );
}
