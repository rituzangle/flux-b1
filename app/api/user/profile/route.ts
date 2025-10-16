/**
 * Path: app/api/user/profile/route.ts
 */

import { NextResponse } from 'next/server';
import { MOCK_MODULES } from '@/src/config/apiPaths';

export async function GET() {
  const { mockUser } = await MOCK_MODULES.user();
  return NextResponse.json(mockUser);
}
