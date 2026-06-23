import {
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { getUserRooms } from './roomService';
import type { AuraUser } from './authService';

/**
 * Update user profile fields
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<AuraUser, 'username' | 'photoURL'>>
): Promise<void> {
  // Update main user doc
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);

  // Sync to all rooms the user is a member of so leaderboards update
  try {
    const userRooms = await getUserRooms(uid);
    for (const room of userRooms) {
      const roomMemberRef = doc(db, 'rooms', room.roomId, 'members', uid);
      await updateDoc(roomMemberRef, updates);
    }
  } catch (error) {
    console.error('Failed to sync profile update to rooms:', error);
  }
}

/**
 * Get user document
 */
export async function getUser(uid: string): Promise<AuraUser | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as AuraUser;
}

/**
 * Upload profile picture to Firebase Storage
 */
export async function uploadProfilePicture(uid: string, uri: string): Promise<string> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log('XHR Error:', e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const storageRef = ref(storage, `profilePictures/${uid}`);
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);

  // Update user document
  await updateUserProfile(uid, { photoURL: downloadURL });

  return downloadURL;
}

/**
 * Mark user as no longer new (after showing welcome modal)
 */
export async function markUserAsExisting(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { isNewUser: false });
}
