/**
 * Path: app/api/transactions/route.ts
 Ensure API transactions route returns runtimeStore.transactions
 */

import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';

export async function GET() {
  return NextResponse.json(runtimeStore.transactions);
}
// --- 12 lines -- Oct 16, 2025
