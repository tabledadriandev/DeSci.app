/**
 * API Error Handling Middleware
 * 
 * Provides consistent error handling across all API routes
 */

export type ApiError = {
  code: string;
  message: string;
  statusCode: number;
};

export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export function createErrorResponse(error: unknown): {
  success: false;
  error: {
    code: string;
    message: string;
  };
} {
  if (error instanceof ApiException) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  if (error instanceof Error) {
    // Log unexpected errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Something went wrong. Please try again later.',
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    },
  };
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T>(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      const statusCode = error instanceof ApiException ? error.statusCode : 500;
      return Response.json(errorResponse, { status: statusCode });
    }
  };
}

