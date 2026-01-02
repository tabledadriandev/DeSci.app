/**
 * API Route: Prove Research Data Provenance with zkTLS
 * 
 * Allows research participants to prove their data came from legitimate
 * medical sources without exposing the actual data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiProtection, apiProtection } from '@/lib/middleware/api-protection';
import { validateRequest } from '@/lib/validation/schemas';
import { zkTlsSchemas } from '@/lib/validation/schemas';
import { zkTlsService } from '@/lib/zk-tls/service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return withApiProtection(
    req,
    async (req, userId) => {
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Validate request body
      const validation = await validateRequest(zkTlsSchemas.researchProvenance, req);
      
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.errors,
          },
          { status: 400 }
        );
      }

      const { dataSource, dataHash, timestamp } = validation.data;

      try {
        // Check if zkTLS is available
        if (!zkTlsService.isAvailable()) {
          return NextResponse.json(
            {
              error: 'zkTLS service not configured',
              message: 'Please configure ZKTLS_VERIFIER_URL and TLSNOTARY_API_KEY',
            },
            { status: 503 }
          );
        }

        // Prove research provenance
        const proof = await zkTlsService.proveResearchProvenance({
          userId,
          dataSource,
          dataHash,
          timestamp: new Date(timestamp),
        });

        return NextResponse.json({
          success: true,
          proof,
        });
      } catch (error) {
        console.error('zkTLS research provenance error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          {
            error: 'Research provenance proof failed',
            message: errorMessage,
          },
          { status: 500 }
        );
      }
    },
    {
      ...apiProtection.authenticated,
      requireAuth: true,
    }
  );
}

