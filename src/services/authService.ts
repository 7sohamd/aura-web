import {
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface AuraUser {
  uid: string;
  email: string;
  username: string;
  photoURL: string | null;
  auraBalance: number;
  createdAt: any;
  isNewUser: boolean;
}

const DEFAULT_AURA_BALANCE = 500000;

/**
 * Create or retrieve user document after Google Sign-In
 */
export async function createOrGetUser(user: User): Promise<{ auraUser: AuraUser; isNew: boolean }> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return {
      auraUser: { uid: user.uid, ...userSnap.data() } as AuraUser,
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
  };

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
