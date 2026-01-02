'use client';

import { motion } from 'framer-motion';
import { Shield, CheckCircle, ExternalLink } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';

interface MetabolicSignatureNFTProps {
  badge: {
    id: string;
    tokenId?: string | null;
    mintTxHash?: string | null;
    metadata: Record<string, unknown>;
  };
}

export default function MetabolicSignatureNFT({ badge }: MetabolicSignatureNFTProps) {
  const isOnchain = !!badge.mintTxHash;

  return (
    <AnimatedCard className="p-6 bg-gradient-to-br from-purple-500/10 to-orange-500/10 border border-purple-500/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              Metabolic Signature NFT
            </h3>
            <p className="text-xs text-text-tertiary">
              Zero-knowledge range proof
            </p>
          </div>
        </div>
        {isOnchain && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>

      {badge.metadata && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Biomarker:</span>
            <span className="text-text-primary font-medium">
              {String(badge.metadata.biomarker || '')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Range:</span>
            <span className="text-text-primary font-medium">
              {String(badge.metadata.range || '')}
            </span>
          </div>
          {badge.metadata.proofHash !== undefined && badge.metadata.proofHash !== null && (
            <div className="text-xs text-text-tertiary font-mono break-all">
              Proof: {String(badge.metadata.proofHash).slice(0, 32)}...
            </div>
          )}
        </div>
      )}

      {badge.mintTxHash && (
        <a
          href={`https://basescan.org/tx/${badge.mintTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-primary hover:underline flex items-center gap-1"
        >
          View on BaseScan
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </AnimatedCard>
  );
}













