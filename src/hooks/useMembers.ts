import { useEffect, useState } from 'react';
import { subscribeToMembers, RoomMember } from '@/services/roomService';
import { useRoomStore } from '@/stores/roomStore';

export function useMembers(roomId: string | null) {
  const { setActiveRoomMembers } = useRoomStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    setIsLoading(true);
    const unsubscribe = subscribeToMembers(roomId, (members) => {
      setActiveRoomMembers(members);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      setActiveRoomMembers([]);
    };
  }, [roomId]);

  const members = useRoomStore((s) => s.activeRoomMembers);

  return { members, isLoading };
}
