'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlowBackgroundProps {
  className1: string;
  className2?: string;
}

export default function GlowBackground({ className1, className2 }: GlowBackgroundProps) {
  return (
    <>
      <motion.div
        className={className1}
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {className2 && (
        <motion.div
          className={className2}
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      )}
    </>
  );
}
