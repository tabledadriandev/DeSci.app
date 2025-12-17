'use client';

// NOTE: This is a lightweight placeholder for end-to-end style encryption.
// In production you would swap this for a real crypto implementation (e.g. libsodium)
// and never ship raw keys to the client.

export async function encryptMessage(plainText: string, key: string): Promise<string> {
  // Simple reversible transform to avoid storing content as plain text.
  // DO NOT treat this as real security; it is only here to fulfill Phase 11 UX.
  const combined = `${key}::${plainText}`;
  return btoa(unescape(encodeURIComponent(combined)));
}

export async function decryptMessage(cipherText: string, key: string): Promise<string> {
  try {
    const decoded = decodeURIComponent(escape(atob(cipherText)));
    const prefix = `${key}::`;
    if (decoded.startsWith(prefix)) {
      return decoded.slice(prefix.length);
    }
    return '';
  } catch {
    return '';
  }
}


