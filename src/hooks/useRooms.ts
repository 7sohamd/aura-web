import { useEffect, useCallback } from 'react';
import { getUserRooms } from '@/services/roomService';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';

export function useRooms() {
  const { user } = useAuthStore();
  const { rooms, isLoadingRooms, setRooms, setLoadingRooms, addRoom } = useRoomStore();

  const fetchRooms = useCallback(async (force = false) => {
    if (!user) return;
    
    const storeRooms = useRoomStore.getState().rooms;
    // Don't show loading state if we already have rooms to prevent flicker
    if (storeRooms.length === 0 || force) {
      setLoadingRooms(true);
    }
    
    try {
      const userRooms = await getUserRooms(user.uid);
      setRooms(userRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setLoadingRooms(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, isLoadingRooms, refetch: fetchRooms, addRoom };
}
