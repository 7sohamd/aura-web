import {
  signInWithCredential,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { updateUserAuraInAllRooms } from './roomService';
import { addNotification } from './notificationService';

export interface AuraUser {
  uid: string;
  email: string;
  username: string;
  photoURL: string | null;
  auraBalance: number;
  createdAt: any;
  isNewUser: boolean;
  lastDailyReward?: string;
  pushSubscription?: any;
}

const DEFAULT_AURA_BALANCE = 2000;

/**
 * Create or retrieve user document after Google Sign-In
 */
export async function createOrGetUser(user: User): Promise<{ auraUser: AuraUser; isNew: boolean }> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const today = new Date().toISOString().split('T')[0];

  if (userSnap.exists()) {
    const data = userSnap.data() as AuraUser;
    let isDailyUpdated = false;

    if (data.lastDailyReward !== today) {
      await updateDoc(userRef, {
        auraBalance: increment(500),
        lastDailyReward: today
      });
      data.auraBalance += 500;
      data.lastDailyReward = today;
      isDailyUpdated = true;
    }

    const authUser = { ...data, uid: user.uid } as AuraUser;

    if (isDailyUpdated) {
      // Also update in all rooms they are a part of
      updateUserAuraInAllRooms(user.uid, 500).catch(console.error);
      addNotification(user.uid, {
        type: 'AURA_RECEIVED',
        senderId: 'system',
        senderUsername: 'System',
        amount: 500,
        roomId: 'daily',
        roomName: 'Daily Reward',
        comment: 'Daily Aura Bonus!'
      }).catch(console.error);
    }

    return {
      auraUser: authUser,
      isNew: false,
    };
  }

  // New user — create document
  const newUser: Omit<AuraUser, 'uid'> = {
    email: user.email || '',
    username: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || null,
    auraBalance: DEFAULT_AURA_BALANCE,
    createdAt: serverTimestamp(),
    isNewUser: true,
    lastDailyReward: today,
  };

  console.log('Creating new user with balance:', DEFAULT_AURA_BALANCE);

  await setDoc(userRef, newUser);

  return {
    auraUser: { uid: user.uid, ...newUser },
    isNew: true,
  };
}

/**
 * Sign in with Google ID token
 */
export async function signInWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return createOrGetUser(result.user);
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return createOrGetUser(result.user);
}

/**
 * Sign in Anonymously
 */
export async function signInGuest() {
  const result = await signInAnonymously(auth);
  return createOrGetUser(result.user);
}

/**
 * Sign out
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
