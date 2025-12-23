import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { withApiProtection, apiProtection, rateLimitConfigs } from '@/lib/middleware/api-protection';
import { validateRequest } from '@/lib/validation/schemas';
import { authSchemas } from '@/lib/validation/schemas';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema for email auth with action
const emailAuthSchema = z.object({
  email: authSchemas.register.shape.email,
  password: z.string().min(1),
  action: z.enum(['login', 'register']),
  username: z.string().min(3).max(30).optional(),
});

export async function POST(request: NextRequest) {
  // Use strict rate limiting for auth routes
  return withApiProtection(
    request,
    async (req) => {
      try {
        // Validate request body with Zod
        const validation = await validateRequest(emailAuthSchema, req);
        
        if (!validation.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              details: validation.error.errors,
            },
            { status: 400 }
          );
        }

        const { email, password, action, username } = validation.data;

        // Get IP and User Agent for session tracking
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                         req.headers.get('x-real-ip') || 
                         'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        if (action === 'register') {
          // Additional password validation (already validated by schema, but double-check)
          if (password.length < 8) {
            return NextResponse.json(
              { error: 'Password must be at least 8 characters' },
              { status: 400 }
            );
          }

      const result = await authService.registerEmail(email, password, username);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Registration failed' },
          { status: result.error?.includes('already registered') ? 409 : 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: result.user,
      });
        } else if (action === 'login') {
          const result = await authService.authenticateEmail(
        email, 
        password, 
        undefined, 
        ipAddress, 
        userAgent
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Invalid credentials' },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        user: result.user,
      });

      if (result.sessionToken) {
        response.cookies.set('sessionToken', result.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60, // 24 hours
        });
      }

      if (result.refreshToken) {
        response.cookies.set('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
      }

          return response;
        } else {
          return NextResponse.json(
            { error: 'Invalid action. Use "login" or "register"' },
            { status: 400 }
          );
        }
      } catch (error: any) {
        console.error('Email auth error:', error);
        return NextResponse.json(
          { error: 'Authentication failed', message: error.message },
          { status: 500 }
        );
      }
    },
    {
      ...apiProtection.public,
      rateLimit: rateLimitConfigs.auth, // Strict rate limiting for auth
      requireCsrf: false, // Auth routes don't need CSRF (they're the entry point)
    }
  );
}

