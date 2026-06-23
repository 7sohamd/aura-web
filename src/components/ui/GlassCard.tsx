import React from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  accent?: boolean;
  noPadding?: boolean;
}

export function GlassCard({ children, className, elevated, accent, noPadding }: GlassCardProps) {
  return (
    <div
      className={`${styles.card} ${elevated ? styles.elevated : ''} ${
        accent ? styles.accent : ''
      } ${noPadding ? styles.noPadding : ''} ${className || ''}`}
    >
      {children}
    </div>
  );
}
