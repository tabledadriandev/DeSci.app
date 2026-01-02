/**
 * EIP-712 Signature Utilities
 * Structured data signing for device attestations
 */

// EIP-712 types (using viem instead of ethers)
export interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: string;
}

export interface TypedDataField {
  name: string;
  type: string;
}

import { keccak256, toBytes, getAddress, stringToBytes } from 'viem';

export interface DeviceAttestationData {
  userId: string;
  deviceId: string;
  dataHash: string;
  timestamp: number;
  metric: string;
  value: number;
}

/**
 * EIP-712 Domain for Table d'Adrian
 */
export function getDomain(chainId: number): TypedDataDomain {
  return {
    name: 'Table d\'Adrian',
    version: '1',
    chainId,
    verifyingContract: process.env.NEXT_PUBLIC_DEVICE_REGISTRY_CONTRACT as string || '0x0000000000000000000000000000000000000000',
  };
}

/**
 * EIP-712 Types for Device Attestation
 */
export const DEVICE_ATTESTATION_TYPES: Record<string, TypedDataField[]> = {
  DeviceAttestation: [
    { name: 'userId', type: 'string' },
    { name: 'deviceId', type: 'string' },
    { name: 'dataHash', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'metric', type: 'string' },
    { name: 'value', type: 'uint256' },
  ],
};

/**
 * Create EIP-712 typed data for device attestation
 */
export function createDeviceAttestationTypedData(
  data: DeviceAttestationData,
  chainId: number = 8453 // Base mainnet
) {
  const domain = getDomain(chainId);
  
  return {
    domain,
    types: DEVICE_ATTESTATION_TYPES,
    primaryType: 'DeviceAttestation',
    message: {
      userId: data.userId,
      deviceId: data.deviceId,
      dataHash: data.dataHash,
      timestamp: data.timestamp,
      metric: data.metric,
      value: data.value,
    },
  };
}

/**
 * Hash the typed data (EIP-712)
 */
export function hashTypedData(
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  primaryType: string,
  message: Record<string, unknown>
): string {
  // This is a simplified version - in production, use viem's hashTypedData
  const domainSeparator = hashDomain(domain);
  const structHash = hashStruct(primaryType, types, message);
  
  return keccak256(
    toBytes(`\x19\x01${domainSeparator}${structHash}`)
  );
}

/**
 * Hash EIP-712 domain
 */
function hashDomain(domain: TypedDataDomain): string {
  const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ];

  return hashStruct('EIP712Domain', { EIP712Domain: domainType }, domain as Record<string, unknown>);
}

/**
 * Hash a struct according to EIP-712
 */
function hashStruct(
  primaryType: string,
  types: Record<string, TypedDataField[]>,
  data: Record<string, unknown>
): string {
  const encoded = encodeData(primaryType, types, data);
  return keccak256(encoded);
}

/**
 * Encode data according to EIP-712
 */
function encodeData(
  primaryType: string,
  types: Record<string, TypedDataField[]>,
  data: Record<string, unknown>
): Uint8Array {
  const encodedTypes: string[] = ['bytes32'];
  const encodedValues: (string | `0x${string}`)[] = [keccak256(stringToBytes(encodeType(primaryType, types)))];

  for (const field of types[primaryType]) {
    const value = data[field.name];
    const encoded = encodeField(types, field.name, field.type, value);
    encodedTypes.push(encoded.type);
    encodedValues.push(encoded.value as string | `0x${string}`);
  }

  // Simplified - full implementation would properly encode all types
  return new Uint8Array();
}

/**
 * Encode a field value
 */
function encodeField(
  types: Record<string, TypedDataField[]>,
  name: string,
  type: string,
  value: unknown
): { type: string; value: string } {
  // Simplified implementation
  if (type === 'string') {
    return { type: 'bytes32', value: keccak256(toBytes(String(value))) };
  }
  if (type === 'uint256') {
    return { type: 'uint256', value: String(value) };
  }
  if (type === 'bytes32') {
    return { type: 'bytes32', value: String(value) };
  }
  if (type === 'address') {
    return { type: 'address', value: getAddress(String(value)) };
  }
  
  return { type: 'bytes32', value: '0x0' };
}

/**
 * Encode type string
 */
function encodeType(
  primaryType: string,
  types: Record<string, TypedDataField[]>
): string {
  let result = `${primaryType}(`;
  const fields = types[primaryType];
  
  for (let i = 0; i < fields.length; i++) {
    result += `${fields[i].type} ${fields[i].name}`;
    if (i < fields.length - 1) {
      result += ',';
    }
  }
  
  result += ')';
  return result;
}

/**
 * Recover signer from EIP-712 signature
 */
import { recoverTypedDataAddress } from 'viem';

export async function recoverSigner(
  typedData: {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    primaryType: string;
    message: Record<string, unknown>;
  },
  signature: `0x${string}`
): Promise<string> {
  try {
    const address = await recoverTypedDataAddress({
      domain: typedData.domain as any,
      types: typedData.types as any,
      primaryType: typedData.primaryType,
      message: typedData.message as any,
      signature,
    });
    return address;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to recover signer: ${errorMessage}`);
  }
}

/**
 * Verify device attestation signature
 */
export async function verifyDeviceAttestation(
  data: DeviceAttestationData,
  signature: `0x${string}`,
  expectedSigner: string,
  chainId: number = 8453
): Promise<boolean> {
  try {
    const typedData = createDeviceAttestationTypedData(data, chainId);
    const signer = await recoverSigner(typedData, signature);
    return signer.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error('Verify device attestation error:', error);
    return false;
  }
}

/**
 * Hash biomarker data for attestation
 */
export function hashBiomarkerData(
  userId: string,
  metric: string,
  value: number,
  timestamp: number,
  metadata?: Record<string, unknown>
): string {
  const data = JSON.stringify({
    userId,
    metric,
    value,
    timestamp,
    metadata: metadata || {},
  });
  
  return keccak256(toBytes(data));
}


