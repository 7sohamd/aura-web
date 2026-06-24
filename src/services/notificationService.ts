import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface AuraNotification {
  id?: string;
  type: 'AURA_RECEIVED';
  senderId: string;
  senderUsername: string;
  amount: number;
  roomId: string;
  roomName: string;
  isRead: boolean;
  createdAt: any;
  comment?: string;
}

export async function addNotification(recipientId: string, notification: Omit<AuraNotification, 'id' | 'isRead' | 'createdAt'>) {
  const notificationsRef = collection(db, 'users', recipientId, 'notifications');
  await addDoc(notificationsRef, {
    ...notification,
    isRead: false,
    createdAt: serverTimestamp()
  });
}

export function subscribeToUnreadNotifications(
  uid: string,
  callback: (notifications: AuraNotification[]) => void
) {
  const notificationsRef = collection(db, 'users', uid, 'notifications');
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuraNotification[];
    
    // Filter client-side to avoid requiring a composite index in Firestore
    const unreadNotifications = notifications.filter(n => n.isRead === false);
    callback(unreadNotifications);
  });
}

export function subscribeToRecentNotifications(
  uid: string,
  limitCount: number = 20,
  callback: (notifications: AuraNotification[]) => void
) {
  const notificationsRef = collection(db, 'users', uid, 'notifications');
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc')
  );
  // Note: we might need a composite index for orderBy if we combine with where, 
  // but for simple recent history we just order by createdAt and limit.
  // We'll filter on the client if needed or just show all recent.

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuraNotification[];
    // Manually slice to limitCount to avoid requiring a complex index
    callback(notifications.slice(0, limitCount));
  });
}

export async function markAsRead(uid: string, notificationId: string) {
  const notifRef = doc(db, 'users', uid, 'notifications', notificationId);
  await updateDoc(notifRef, {
    isRead: true
  });
}

export async function markAllAsRead(uid: string, notificationIds: string[]) {
  if (!notificationIds.length) return;
  const batch = writeBatch(db);
  notificationIds.forEach(id => {
    const notifRef = doc(db, 'users', uid, 'notifications', id);
    batch.update(notifRef, { isRead: true });
  });
  await batch.commit();
}
