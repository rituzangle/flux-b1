/**
 * Path: app/api/user/profile/route.ts
 Ensure user profile API returns runtimeStore.user
 */
import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';

export async function GET() {
  return NextResponse.json(runtimeStore.user);
}

// --- 12 lines --- Oct 16, 2025