/**
 * Generate sharing links for rooms
 */

export function getDeepLink(roomId: string): string {
  return `aura://room/${roomId}`;
}

export function getWebLink(roomId: string): string {
  return `https://aura.app/room/${roomId}`;
}

export function getShareMessage(roomId: string, roomName: string): string {
  return `Join "${roomName}" on Aura!\n\nRoom ID: ${roomId}\n\nOpen in app: ${getDeepLink(roomId)}\nOr visit: ${getWebLink(roomId)}`;
}
