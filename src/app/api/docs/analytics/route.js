import { NextResponse } from "next/server";

/**
 * Analytics endpoint - DISABLED FOR PRODUCTION
 *
 * The DocumentationEvent and DocumentationModule models are not present in the current
 * Prisma schema. This endpoint is temporarily disabled to prevent production errors.
 *
 * To re-enable:
 * 1. Add the required models to schema.prisma
 * 2. Run prisma migrate dev
 * 3. Restore the original implementation
 */

// POST - Track documentation events (DISABLED)
export async function POST(req) {
  // Analytics tracking disabled - DocumentationEvent model not in schema
  return NextResponse.json({
    success: true,
    message: 'Analytics tracking disabled in production'
  });
}

// GET - Retrieve analytics data (DISABLED)
export async function GET(req) {
  // Analytics retrieval disabled - DocumentationEvent model not in schema
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Analytics retrieval disabled in production'
  });
}
