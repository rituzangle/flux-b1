/**
 * app/api/user/route.ts
 * Returns the current user's profile.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    id: 'user-1',
    name: 'Ritu',
    onboardingComplete: true,
    email: 'ritu@example.com',
    lastDonationDate: '2025-10-01',
    generosityScore: 87,
    preferredCharityId: 'charity-2',
    seasonalTriggersSeen: ['thanksgiving-2025'],
  });
}
