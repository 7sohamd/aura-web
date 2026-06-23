import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Transaction {
  id?: string;
  senderId: string;
  senderUsername: string;
  senderPhotoURL: string | null;
  recipientId: string;
  recipientUsername: string;
  recipientPhotoURL: string | null;
  amount: number;
  roomId: string;
  roomName: string;
  createdAt: any;
  comment?: string;
}

/**
 * Transfer aura points between users (atomic Firestore transaction)
 */
export async function transferAura(
  roomId: string,
  roomName: string,
  senderId: string,
  senderUsername: string,
  senderPhotoURL: string | null,
  recipientId: string,
  recipientUsername: string,
  recipientPhotoURL: string | null,
  amount: number,
  comment?: string
): Promise<void> {
  if (senderId === recipientId) {
    throw new Error('Cannot send Aura to yourself.');
  }
  if (amount < 1) {
    throw new Error('Minimum transfer is 1 Aura.');
  }

  await runTransaction(db, async (transaction) => {
    // Read sender's global balance
    const senderUserRef = doc(db, 'users', senderId);
    const senderSnap = await transaction.get(senderUserRef);
    if (!senderSnap.exists()) throw new Error('Sender not found.');

    const senderBalance = senderSnap.data().auraBalance;
    if (senderBalance < amount) {
      throw new Error('Insufficient Aura balance.');
    }

    // Read recipient's global balance
    const recipientUserRef = doc(db, 'users', recipientId);
    const recipientSnap = await transaction.get(recipientUserRef);
    if (!recipientSnap.exists()) throw new Error('Recipient not found.');

    const recipientBalance = recipientSnap.data().auraBalance;

    // Update global balances
    transaction.update(senderUserRef, {
      auraBalance: senderBalance - amount,
    });
    transaction.update(recipientUserRef, {
      auraBalance: recipientBalance + amount,
    });

    // Update denormalized member balances in the room
    const senderMemberRef = doc(db, 'rooms', roomId, 'members', senderId);
    const recipientMemberRef = doc(db, 'rooms', roomId, 'members', recipientId);

    transaction.update(senderMemberRef, {
      auraBalance: senderBalance - amount,
    });
    transaction.update(recipientMemberRef, {
      auraBalance: recipientBalance + amount,
    });
  });

  // Add transaction record (outside the transaction for simplicity)
  await addDoc(collection(db, 'rooms', roomId, 'transactions'), {
    senderId,
    senderUsername,
    senderPhotoURL,
    recipientId,
    recipientUsername,
    recipientPhotoURL,
    amount,
    roomId,
    roomName,
    createdAt: serverTimestamp(),
    ...(comment ? { comment } : {}),
  });
}

/**
 * Subscribe to room transactions (realtime)
 */
export function subscribeToTransactions(
  roomId: string,
  callback: (transactions: Transaction[]) => void
) {
  const txRef = collection(db, 'rooms', roomId, 'transactions');
  const q = query(txRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
    callback(transactions);
  });
}

/**
 * Get all transactions for a user across rooms
 */
export async function getUserTransactions(
  uid: string,
  roomIds: string[]
): Promise<Transaction[]> {
  const allTransactions: Transaction[] = [];

  for (const roomId of roomIds) {
    const txRef = collection(db, 'rooms', roomId, 'transactions');
    const q = query(txRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    snapshot.docs.forEach((doc) => {
      const tx = { id: doc.id, ...doc.data() } as Transaction;
      // Only include transactions involving the user
      if (tx.senderId === uid || tx.recipientId === uid) {
        allTransactions.push(tx);
      }
    });
  }

  // Sort by createdAt descending
  return allTransactions.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
}
