/**
 * Path: app/api/donate/route.ts
 * Endpoint: POST /api/donate
 * Purpose:
 * - Preserve keeper logic (amountInCents → dollars, 95/5 split, impact calc)
 * - Validate payload strictly
 * - Use unified runtimeStore (single source of truth during dev) for charities/user/transactions
 * - Generate dynamic insights via donations mock (generateDynamicInsights OR generateMockInsights)
 * - Create transaction object, persist to runtimeStore.transactions, update runtimeStore.user.balance
 * - Return structured response: { success, transaction, user, insights }
 * - Health-check GET supported
 *
 * Notes:
 * - runtimeStore is expected at src/mocks/runtimeStore.ts and to be imported here
 * - mocks/donations should expose generateDynamicInsights or generateMockInsights
 * - Keeper logic and numeric rounding preserved; no hardcoded insights
 */

import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { MOCK_MODULES } from '@/src/config/apiPaths';
import { logger } from '@/src/utils/prettyLogs';

type DonatePayload = {
  charityId: string;
  amountInCents: number;
  note?: string;
};

type Transaction = {
  id: string;
  type: 'donation' | string;
  charityId: string;
  charityName: string;
  charityEmoji?: string;
  amount: number; // dollars
  platformFee: number;
  charityAmount: number;
  impact: number;
  impactMetric?: string;
  note?: string;
  createdAt: string;
};

export async function GET() {
  logger.info('DonateRoute: health check', 'DonateRoute');
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

export async function POST(req: Request) {
  let body: DonatePayload | undefined;
  try {
    body = await req.json();
  } catch (err: any) {
    logger.warn('DonateRoute: invalid JSON body', 'DonateRoute');
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    logger.warn(`DonateRoute: validation failed: ${validationError}`, 'DonateRoute');
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { charityId, amountInCents, note } = body!;
  try {
    // Resolve charity from runtimeStore (single source of truth in dev)
    const charity = runtimeStore.charities.find((c: any) => c.id === charityId);
    if (!charity) {
      const msg = `Unknown charityId: ${charityId}`;
      logger.warn(`DonateRoute: ${msg}`, 'DonateRoute');
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    // Keeper logic: convert cents -> dollars; apply platform fee split
    const amountInDollars = Number((amountInCents / 100).toFixed(2));
    const platformFee = Number((amountInDollars * 0.05).toFixed(2));
    const charityAmount = Number((amountInDollars - platformFee).toFixed(2));

    // Impact using charity's metadata (impactRate)
    const impactRate = Number(charity?.impactRate || 0);
    const impactMetric = charity?.impactMetric ? String(charity.impactMetric) : undefined;
    const impact = Math.max(0, Math.round(charityAmount * impactRate));

    logger.info(
      `DonateRoute: processing donation charity=${charityId} amount=$${amountInDollars} impact=${impact} ${impactMetric ?? ''}`,
      'DonateRoute'
    );

    // Simulate processing delay for realism
    await sleep(1200);

    // Generate dynamic insights from donations mock (prefer dynamic generator)
    let insights: any[] = [];
    try {
      const donationsMod = await MOCK_MODULES.donations();
      const dynamicGen = (donationsMod as any).generateDynamicInsights;
      const mockGen = (donationsMod as any).generateMockInsights;

      if (typeof dynamicGen === 'function') {
        insights = await dynamicGen(amountInDollars, charity, impact);
      } else if (typeof mockGen === 'function') {
        insights = await mockGen(charityId, amountInDollars);
      } else {
        insights = [];
      }
    } catch (insErr: any) {
      logger.warn(`DonateRoute: insights generation failed: ${insErr?.message || insErr}`, 'DonateRoute');
      insights = [];
    }

    // Build transaction object and persist to runtimeStore
    const txn: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'donation',
      charityId: charity.id,
      charityName: charity.name,
      charityEmoji: charity.emoji,
      amount: amountInDollars,
      platformFee,
      charityAmount,
      impact,
      impactMetric,
      note: note || '',
      createdAt: new Date().toISOString(),
    };

    // Unshift so newest transactions appear first
    runtimeStore.transactions.unshift(txn);

    // Update user balance (protect numeric invariants)
    if (typeof runtimeStore.user.balance === 'number') {
      runtimeStore.user.balance = Number((runtimeStore.user.balance - amountInDollars).toFixed(2));
      if (Number.isNaN(runtimeStore.user.balance) || runtimeStore.user.balance < 0) {
        runtimeStore.user.balance = 0;
      }
    }

    const response = {
      success: true,
      transaction: txn,
      user: runtimeStore.user,
      insights,
    };

    logger.info(`DonateRoute: completed txn=${txn.id} charity=${charityId} amount=$${amountInDollars}`, 'DonateRoute');
    return NextResponse.json(response, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || 'Donation processing failed';
    logger.error(`DonateRoute: unexpected error: ${msg}`, 'DonateRoute');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* Helpers */

function validate(body?: DonatePayload): string | null {
  if (!body || typeof body !== 'object') return 'Missing request body';
  const { charityId, amountInCents } = body;
  if (!charityId || typeof charityId !== 'string' || charityId.trim() === '') return 'charityId is required';
  if (amountInCents === undefined || amountInCents === null) return 'amountInCents is required';
  if (typeof amountInCents !== 'number' || Number.isNaN(amountInCents)) return 'amountInCents must be a number';
  if (amountInCents <= 0) return 'amountInCents must be greater than 0';
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- 84 lines --- Oct 16, 2025
