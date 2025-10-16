/**
 * Path: app/api/transactions/route.ts
 */

import { NextResponse } from 'next/server';
import { MOCK_MODULES } from '@/src/config/apiPaths';

export async function GET() {
  const { mockTransactions } = await MOCK_MODULES.transactions();
  return NextResponse.json(mockTransactions);
}
