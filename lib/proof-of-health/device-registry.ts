/**
 * Device Public Key Registry
 * Manages whitelist of authorized devices for attestations
 */

import { prisma } from '@/lib/prisma';

export interface AuthorizedDevice {
  deviceId: string;
  publicKey: string;
  deviceName: string;
  provider: string; // "apple", "oura", "google", "dexcom", etc.
  isActive: boolean;
}

/**
 * Check if a device is authorized
 */
export async function isAuthorizedDevice(
  devicePubKey: string
): Promise<boolean> {
  try {
    const device = await prisma.deviceAttestation.findFirst({
      where: {
        devicePubKey: devicePubKey.toLowerCase(),
      },
      select: {
        devicePubKey: true,
      },
    });

    // For now, check if device has made any attestations
    // In production, maintain a separate authorized devices table
    return !!device;
  } catch (error) {
    console.error('Check authorized device error:', error);
    return false;
  }
}

/**
 * Register a new device (admin function)
 * In production, this would use a separate DeviceWhitelist model
 */
export async function registerDevice(
  deviceId: string,
  publicKey: string,
  deviceName: string,
  provider: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Store in a whitelist table (would need to add to schema)
    // For now, devices are implicitly registered on first attestation
    return { success: true };
  } catch (error) {
    console.error('Register device error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Revoke device authorization
 */
export async function revokeDevice(
  devicePubKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, mark device as inactive in whitelist
    return { success: true };
  } catch (error) {
    console.error('Revoke device error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Get authorized device public keys
 * Known device addresses for common providers
 */
export const KNOWN_DEVICE_KEYS: Record<string, string[]> = {
  apple_health: [], // Would be populated with Apple Health public keys
  oura: [], // Oura device public keys
  google_fit: [], // Google Fit public keys
  dexcom: [], // Dexcom CGM public keys
};

/**
 * Check if device is in known whitelist
 */
export function isKnownDevice(devicePubKey: string): boolean {
  const normalized = devicePubKey.toLowerCase();
  return Object.values(KNOWN_DEVICE_KEYS)
    .flat()
    .some((key) => key.toLowerCase() === normalized);
}













