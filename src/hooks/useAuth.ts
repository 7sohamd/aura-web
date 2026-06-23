import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { createOrGetUser } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    showWelcome,
    setUser,
    setLoading,
    setShowWelcome,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { auraUser, isNew } = await createOrGetUser(firebaseUser);
          setUser(auraUser);
          if (isNew) {
            setShowWelcome(true);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  return { user, isLoading, isAuthenticated, showWelcome };
}
