'use client';

import React, { useEffect } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import styles from './AnimatedNumber.module.css';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1500,
  className,
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const previousValue = React.useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = previousValue.current;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={`${styles.text} ${className || ''}`}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
}
