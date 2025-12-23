/**
 * API Route: Verify Credential with zkTLS
 * 
 * Allows healthcare providers to verify their credentials without
 * exposing credential documents.
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
      const validation = await validateRequest(zkTlsSchemas.verifyCredential, req);
      
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.errors,
          },
          { status: 400 }
        );
      }

      const { credentialType, credentialUrl, publicFields } = validation.data;

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

        // Verify credential
        const proof = await zkTlsService.verifyCredential({
          userId,
          credentialType,
          credentialUrl,
          publicFields,
        });

        return NextResponse.json({
          success: true,
          proof,
        });
      } catch (error: any) {
        console.error('zkTLS credential verification error:', error);
        return NextResponse.json(
          {
            error: 'Credential verification failed',
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

