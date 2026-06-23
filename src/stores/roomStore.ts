import { create } from 'zustand';
import type { Room, RoomMember } from '@/services/roomService';

interface RoomState {
  rooms: Room[];
  activeRoom: Room | null;
  activeRoomMembers: RoomMember[];
  isLoadingRooms: boolean;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  setActiveRoom: (room: Room | null) => void;
  setActiveRoomMembers: (members: RoomMember[]) => void;
  setLoadingRooms: (loading: boolean) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  activeRoom: null,
  activeRoomMembers: [],
  isLoadingRooms: false,

  setRooms: (rooms) => set({ rooms, isLoadingRooms: false }),

  addRoom: (room) =>
    set((state) => ({
      rooms: [room, ...state.rooms],
    })),

  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.roomId !== roomId),
    })),

  setActiveRoom: (activeRoom) => set({ activeRoom }),

  setActiveRoomMembers: (activeRoomMembers) => set({ activeRoomMembers }),

  setLoadingRooms: (isLoadingRooms) => set({ isLoadingRooms }),

  reset: () =>
    set({
      rooms: [],
      activeRoom: null,
      activeRoomMembers: [],
      isLoadingRooms: false,
    }),
}));
