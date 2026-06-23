import { useEffect, useCallback } from 'react';
import { getUserRooms } from '@/services/roomService';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';

export function useRooms() {
  const { user } = useAuthStore();
  const { rooms, isLoadingRooms, setRooms, setLoadingRooms, addRoom } = useRoomStore();

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    setLoadingRooms(true);
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
