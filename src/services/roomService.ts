import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { generateRoomId } from '@/utils/generateRoomId';

export interface Room {
  roomId: string;
  roomName: string;
  ownerId: string;
  createdAt: any;
  memberCount: number;
}

export interface RoomMember {
  uid: string;
  username: string;
  photoURL: string | null;
  auraBalance: number;
  joinedAt: any;
}

/**
 * Create a new room
 */
export async function createRoom(
  ownerId: string,
  roomName: string,
  ownerUsername: string,
  ownerPhotoURL: string | null,
  ownerAuraBalance: number
): Promise<Room> {
  let roomId = generateRoomId();

  // Ensure unique room ID
  let existing = await getDoc(doc(db, 'rooms', roomId));
  while (existing.exists()) {
    roomId = generateRoomId();
    existing = await getDoc(doc(db, 'rooms', roomId));
  }

  const room: Room = {
    roomId,
    roomName,
    ownerId,
    createdAt: serverTimestamp(),
    memberCount: 1,
  };

  // Create room document
  await setDoc(doc(db, 'rooms', roomId), room);

  // Add owner as first member
  await setDoc(doc(db, 'rooms', roomId, 'members', ownerId), {
    uid: ownerId,
    username: ownerUsername,
    photoURL: ownerPhotoURL,
    auraBalance: ownerAuraBalance,
    joinedAt: serverTimestamp(),
  });

  return room;
}

/**
 * Join an existing room
 */
export async function joinRoom(
  roomId: string,
  uid: string,
  username: string,
  photoURL: string | null,
  auraBalance: number
): Promise<Room> {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room not found. Please check the Room ID.');
  }

  // Check if already a member
  const memberRef = doc(db, 'rooms', roomId, 'members', uid);
  const memberSnap = await getDoc(memberRef);

  if (memberSnap.exists()) {
    throw new Error('You are already a member of this room.');
  }

  // Add member
  await setDoc(memberRef, {
    uid,
    username,
    photoURL,
    auraBalance,
    joinedAt: serverTimestamp(),
  });

  // Increment member count
  await updateDoc(roomRef, {
    memberCount: increment(1),
  });

  return { ...roomSnap.data(), roomId } as Room;
}

/**
 * Get room details
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  const roomSnap = await getDoc(doc(db, 'rooms', roomId));
  if (!roomSnap.exists()) return null;
  return roomSnap.data() as Room;
}

/**
 * Subscribe to room members (realtime)
 */
export function subscribeToMembers(
  roomId: string,
  callback: (members: RoomMember[]) => void
) {
  const membersRef = collection(db, 'rooms', roomId, 'members');
  return onSnapshot(membersRef, (snapshot) => {
    const members = snapshot.docs
      .map((doc) => doc.data() as RoomMember)
      .sort((a, b) => b.auraBalance - a.auraBalance);
    callback(members);
  });
}

/**
 * Get all rooms a user is a member of
 */
export async function getUserRooms(uid: string): Promise<Room[]> {
  // Since Firestore doesn't support collection group queries on subcollections easily,
  // we'll query all rooms and check membership
  // For production, consider maintaining a userRooms subcollection on the user document
  const roomsRef = collection(db, 'rooms');
  const roomsSnap = await getDocs(roomsRef);
  const rooms: Room[] = [];

  for (const roomDoc of roomsSnap.docs) {
    const memberRef = doc(db, 'rooms', roomDoc.id, 'members', uid);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      rooms.push(roomDoc.data() as Room);
    }
  }

  return rooms;
}

/**
 * Leave a room
 */
export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, 'rooms', roomId, 'members', uid));
  await updateDoc(doc(db, 'rooms', roomId), {
    memberCount: increment(-1),
  });
}

/**
 * Update room name
 */
export async function updateRoomName(roomId: string, newName: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    roomName: newName,
  });
}

/**
 * Delete a room
 */
export async function deleteRoom(roomId: string): Promise<void> {
  // Delete members subcollection
  const membersRef = collection(db, 'rooms', roomId, 'members');
  const membersSnap = await getDocs(membersRef);
  const deleteMemberPromises = membersSnap.docs.map(docSnap => 
    deleteDoc(doc(db, 'rooms', roomId, 'members', docSnap.id))
  );
  await Promise.all(deleteMemberPromises);
  
  // Delete transactions subcollection
  const txRef = collection(db, 'rooms', roomId, 'transactions');
  const txSnap = await getDocs(txRef);
  const deleteTxPromises = txSnap.docs.map(docSnap => 
    deleteDoc(doc(db, 'rooms', roomId, 'transactions', docSnap.id))
  );
  await Promise.all(deleteTxPromises);

  // Delete the main room document
  await deleteDoc(doc(db, 'rooms', roomId));
}
