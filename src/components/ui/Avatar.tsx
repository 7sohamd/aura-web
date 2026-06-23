import React from 'react';
import Image from 'next/image';
import styles from './Avatar.module.css';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  showBorder?: boolean;
}

export function Avatar({ uri, name, size = 48, showBorder = true }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={`${styles.container} ${showBorder ? styles.border : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    >
      {uri ? (
        <img
          src={uri}
          alt={name || 'Avatar'}
          style={{
            width: size - 2,
            height: size - 2,
            borderRadius: (size - 2) / 2,
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          className={styles.placeholder}
          style={{
            width: size - 2,
            height: size - 2,
            borderRadius: (size - 2) / 2,
          }}
        >
          <span className={styles.initials} style={{ fontSize: size * 0.35 }}>
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
