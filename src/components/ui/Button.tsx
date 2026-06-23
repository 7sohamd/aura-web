import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './Button.module.css';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant" | "size"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      children,
      disabled,
      title,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled || loading ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${
          fullWidth ? styles.fullWidth : ''
        } ${disabled || loading ? styles.disabled : ''} ${className || ''}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className={styles.spinner} />
        ) : (
          <>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.text}>{title || (children as React.ReactNode)}</span>
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
