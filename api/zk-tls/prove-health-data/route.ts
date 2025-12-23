/**
 * API Route: Generate zkTLS Proof for Health Data
 * 
 * Allows users to generate zero-knowledge proofs of their health data
 * without exposing sensitive information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiProtection, apiProtection } from '@/lib/middleware/api-protection';
import { validateRequest } from '@/lib/validation/schemas';
import { zkTlsSchemas } from '@/lib/validation/schemas';
import { zkTlsService } from '@/lib/zk-tls/service';
import { authService } from '@/lib/auth';

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
      const validation = await validateRequest(zkTlsSchemas.proveHealthData, req);
      
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.errors,
          },
          { status: 400 }
        );
      }

      const { dataType, dataId, publicFields, privateFields } = validation.data;

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

        // Generate proof
        const proof = await zkTlsService.proveHealthData({
          userId,
          dataType,
          dataId,
          publicFields,
          privateFields,
        });

        return NextResponse.json({
          success: true,
          proof,
        });
      } catch (error: any) {
        console.error('zkTLS proof generation error:', error);
        return NextResponse.json(
          {
            error: 'Proof generation failed',
            message: error.message || 'Unknown error',
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

