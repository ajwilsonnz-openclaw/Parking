import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all non-static routes and API routes
    '/((?!_next|.*\\..*).*)',
    '/api/(.*)',
  ],
};
