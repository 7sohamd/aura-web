'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth(); // Initializes Firebase auth listener and updates zustand store
  return <>{children}</>;
}
