/**
 * Proof-of-Health Cryptographic Utilities
 * Merkle tree implementation for biomarker log commitments
 */

import crypto from 'crypto';

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string | Buffer;
}

export interface MerkleProof {
  leaf: string;
  path: string[];
  indices: number[]; // 0 = left, 1 = right
}

/**
 * Hash data using SHA-256
 */
export function hashData(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash biomarker log entry
 * Format: userId|metric|value|date|timestamp
 */
export function hashBiomarkerLog(
  userId: string,
  metric: string,
  value: number,
  date: Date,
  metadata?: Record<string, unknown>
): string {
  const data = JSON.stringify({
    userId,
    metric,
    value,
    date: date.toISOString(),
    metadata: metadata || {},
  });
  return hashData(data);
}

/**
 * Build a Merkle tree from an array of leaf hashes
 */
export function buildMerkleTree(leaves: string[]): MerkleNode | null {
  if (leaves.length === 0) {
    return null;
  }

  if (leaves.length === 1) {
    return {
      hash: leaves[0],
      data: leaves[0],
    };
  }

  // Build leaf nodes
  const nodes: MerkleNode[] = leaves.map((leaf: string) => ({
    hash: leaf,
    data: leaf,
  }));

  // Build tree bottom-up
  while (nodes.length > 1) {
    const nextLevel: MerkleNode[] = [];

    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = i + 1 < nodes.length ? nodes[i + 1] : left; // Duplicate last node if odd

      // Always combine in consistent order (left then right)
      const combined = `${left.hash}${right.hash}`;
      const parentHash = hashData(combined);

      nextLevel.push({
        hash: parentHash,
        left,
        right,
      });
    }

    nodes.splice(0, nodes.length, ...nextLevel);
  }

  return nodes[0];
}

/**
 * Get Merkle root from tree
 */
export function getMerkleRoot(tree: MerkleNode | null): string | null {
  return tree?.hash || null;
}

/**
 * Generate Merkle proof for a specific leaf
 */
export function generateMerkleProof(
  tree: MerkleNode | null,
  leafHash: string
): MerkleProof | null {
  if (!tree) {
    return null;
  }

  const proof: MerkleProof = {
    leaf: leafHash,
    path: [],
    indices: [],
  };

  function findLeaf(node: MerkleNode | undefined, target: string, path: string[], indices: number[]): boolean {
    if (!node) {
      return false;
    }

    // If this is a leaf node
    if (!node.left && !node.right) {
      if (node.hash.toLowerCase() === target.toLowerCase()) {
        return true;
      }
      return false;
    }

    // Check left subtree
    if (node.left) {
      if (findLeaf(node.left, target, path, indices)) {
        if (node.right) {
          path.push(node.right.hash);
          indices.push(1); // Right sibling
        }
        return true;
      }
    }

    // Check right subtree
    if (node.right) {
      if (findLeaf(node.right, target, path, indices)) {
        if (node.left) {
          path.push(node.left.hash);
          indices.push(0); // Left sibling
        }
        return true;
      }
    }

    return false;
  }

  const found = findLeaf(tree, leafHash, proof.path, proof.indices);
  if (!found) {
    return null;
  }

  // Reverse path and indices to go from leaf to root
  proof.path.reverse();
  proof.indices.reverse();

  return proof;
}

/**
 * Verify Merkle proof
 */
export function verifyMerkleProof(proof: MerkleProof, root: string): boolean {
  let currentHash = proof.leaf;

  for (let i = 0; i < proof.path.length; i++) {
    const sibling = proof.path[i];
    const isRight = proof.indices[i] === 1;

    // Always combine left then right (consistent with tree building)
    const combined = isRight
      ? `${currentHash}${sibling}`
      : `${sibling}${currentHash}`;

    currentHash = hashData(combined);
  }

  return currentHash.toLowerCase() === root.toLowerCase();
}

/**
 * Generate weekly Merkle root from daily biomarker logs
 */
export interface BiomarkerLogEntry {
  id: string;
  userId: string;
  metric: string;
  value: number;
  date: Date;
  metadata?: Record<string, unknown>;
}

export function generateWeeklyMerkleRoot(
  logs: BiomarkerLogEntry[],
  weekStart: Date
): { root: string; tree: MerkleNode; leaves: string[] } | null {
  if (logs.length === 0) {
    return null;
  }

  // Hash each log entry
  const leaves = logs.map((log: typeof logs[0]) =>
    hashBiomarkerLog(log.userId, log.metric, log.value, log.date, log.metadata)
  );

  // Build Merkle tree
  const tree = buildMerkleTree(leaves);
  if (!tree) {
    return null;
  }

  const root = getMerkleRoot(tree);
  if (!root) {
    return null;
  }

  return {
    root,
    tree,
    leaves,
  };
}

/**
 * Get week boundary for a given date
 * Weeks start on Monday (ISO week)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Convert Merkle root to bytes32 format (for Solidity)
 */
export function rootToBytes32(root: string): string {
  // Remove 0x prefix if present, ensure it's 64 hex chars
  const cleanRoot = root.startsWith('0x') ? root.slice(2) : root;
  return `0x${cleanRoot.padStart(64, '0').slice(0, 64)}`;
}













