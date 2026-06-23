/**
 * Generate a unique room ID in format: AURA-XXXXXX
 * Uses uppercase alphanumeric characters
 */
export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AURA-${code}`;
}

/**
 * Validate room ID format
 */
export function isValidRoomId(roomId: string): boolean {
  return /^AURA-[A-Z0-9]{6}$/.test(roomId.toUpperCase());
}

/**
 * Extract room ID from various input formats
 */
export function extractRoomId(input: string): string | null {
  const trimmed = input.trim().toUpperCase();
  
  // Direct room ID
  if (isValidRoomId(trimmed)) {
    return trimmed;
  }

  // Deep link: aura://room/AURA-XXXXXX
  const deepLinkMatch = input.match(/aura:\/\/room\/(AURA-[A-Z0-9]{6})/i);
  if (deepLinkMatch) {
    return deepLinkMatch[1].toUpperCase();
  }

  // Web link: https://aura.app/room/AURA-XXXXXX
  const webLinkMatch = input.match(/aura\.app\/room\/(AURA-[A-Z0-9]{6})/i);
  if (webLinkMatch) {
    return webLinkMatch[1].toUpperCase();
  }

  return null;
}
