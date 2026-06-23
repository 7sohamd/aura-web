import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
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
    let userUnsubscribe: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { auraUser, isNew } = await createOrGetUser(firebaseUser);
          setUser(auraUser);
          if (isNew) {
            setShowWelcome(true);
          }

          // Listen for real-time updates to the user's document
          userUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              const newData = { uid: firebaseUser.uid, ...docSnap.data() } as any;
              const currentState = useAuthStore.getState().user;
              // Only update if data actually changed to prevent unnecessary re-renders
              if (JSON.stringify(currentState) !== JSON.stringify(newData)) {
                setUser(newData);
              }
            }
          });
        } catch (error) {
          console.error('Error loading user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        if (userUnsubscribe) {
          userUnsubscribe();
          userUnsubscribe = undefined;
        }
      }
    });

    return () => {
      unsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };
  }, []);

  return { user, isLoading, isAuthenticated, showWelcome };
}
