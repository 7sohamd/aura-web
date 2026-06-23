import { create } from 'zustand';
import type { AuraUser } from '@/services/authService';

interface AuthState {
  user: AuraUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  showWelcome: boolean;
  setUser: (user: AuraUser | null) => void;
  setLoading: (loading: boolean) => void;
  setIsNewUser: (isNew: boolean) => void;
  setShowWelcome: (show: boolean) => void;
  updateBalance: (newBalance: number) => void;
  updateProfile: (updates: Partial<Pick<AuraUser, 'username' | 'photoURL'>>) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isNewUser: false,
  showWelcome: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setIsNewUser: (isNewUser) => set({ isNewUser }),

  setShowWelcome: (showWelcome) => set({ showWelcome }),

  updateBalance: (newBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, auraBalance: newBalance } : null,
    })),

  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  reset: () =>
    set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isNewUser: false,
      showWelcome: false,
    }),
}));
