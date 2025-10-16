/**
 * Path: app/api/donate/route.ts
 * POST /api/donate
 * - Preserves keeper logic (amountInCents -> dollars, 95/5 split, impact)
 * - Updates runtimeStore: pushes transaction, adjusts user.balance
 * - Returns { success, transaction, user }
 */

import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { MOCK_MODULES } from '@/src/config/apiPaths';
import { logger } from '@/src/utils/prettyLogs';

type DonatePayload = { charityId: string; amountInCents: number; note?: string };

export async function POST(req: Request) {
  let body: DonatePayload | undefined;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.charityId || typeof body.amountInCents !== 'number' || body.amountInCents <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { charityId, amountInCents, note } = body;
  const charity = runtimeStore.charities.find((c) => c.id === charityId);
  if (!charity) return NextResponse.json({ error: 'Unknown charityId' }, { status: 404 });

  // Keeper logic
  const amountInDollars = Number((amountInCents / 100).toFixed(2));
  const platformFee = Number((amountInDollars * 0.05).toFixed(2));
  const charityAmount = Number((amountInDollars - platformFee).toFixed(2));
  const impactRate = Number(charity.impactRate || 0);
  const impact = Math.round(charityAmount * impactRate);

  logger.info(`Donate: $${amountInDollars} to ${charity.name} (impact ${impact})`, 'DonateAPI');

  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 1500));

  // Build transaction
  const transaction = {
    id: `txn_${Date.now()}`,
    type: 'donation',
    charityId,
    charityName: charity.name,
    amount: amountInDollars,
    platformFee,
    charityAmount,
    impact,
    impactMetric: charity.impactMetric,
    note: note || '',
    createdAt: new Date().toISOString(),
  };

  // Update runtime store: push transaction and adjust user balance
  runtimeStore.transactions.unshift(transaction);

  // Subtract from user's available balance if numeric
  if (typeof runtimeStore.user.balance === 'number') {
    runtimeStore.user.balance = Number((runtimeStore.user.balance - amountInDollars).toFixed(2));
    if (runtimeStore.user.balance < 0) runtimeStore.user.balance = 0;
  }

  // Dynamic insights via donations mock if available
  let insights: any[] = [];
  try {
    const donationsMod = await MOCK_MODULES.donations();
    if (typeof donationsMod.generateDynamicInsights === 'function') {
      insights = await donationsMod.generateDynamicInsights(amountInDollars, charity, impact);
    } else if (typeof donationsMod.generateMockInsights === 'function') {
      insights = await donationsMod.generateMockInsights(charityId, amountInDollars);
    }
  } catch (e) {
    logger.warn('DonateAPI: insights generation failed', 'DonateAPI');
  }

  const response = { success: true, transaction, user: runtimeStore.user, insights };
  return NextResponse.json(response, { status: 200 });
}
// --- 84 lines --- Oct 16, 2025
