import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, subtitle, icon, className, children }: EmptyStateProps) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <h3 className={styles.title}>{title}</h3>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </div>
  );
}
