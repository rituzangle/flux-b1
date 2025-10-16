// File: app/api/charities/route.ts
// Purpose: API route to return list of charities

import { charities } from '@/src/mocks/charities';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(charities);
}
