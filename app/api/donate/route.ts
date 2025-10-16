/**
 * Path: app/api/donate/route.ts
 * Endpoint: POST /api/donate
 * Keeper logic preserved and enhanced:
 * - Accepts amountInCents; converts to dollars
 * - Splits: 95% charity, 5% platform
 * - Impact calculated using charity.impactRate and impactMetric
 * - Simulates processing delay
 * - Generates dynamic insights via generateDynamicInsights(charity, amount, impact)
 * - Validates charity existence and payload shape
 * - Structured logging with prettyLogs
 */

import { NextResponse } from 'next/server';
import { MOCK_MODULES } from '@/src/config/apiPaths';
import { logger } from '@/src/utils/prettyLogs';

type DonatePayload = {
  charityId: string;
  amountInCents: number;
  note?: string;
};

type DonateResponse = {
  success: boolean;
  transactionId: string;
  charity: {
    id: string;
    name: string;
    emoji?: string;
  };
  amount: number;         // dollars
  platformFee: number;    // dollars
  charityAmount: number;  // dollars
  impact: number;
  impactMetric?: string;
  insights: any[];        // keep open shape for AIInsight[]
  note?: string;
};

export async function GET() {
  logger.info('DonateRoute: health check', 'DonateRoute');
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

export async function POST(req: Request) {
  let body: DonatePayload | undefined;

  try {
    body = await req.json();
  } catch {
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
    // Single source of truth: mocks for charities and dynamic insights
    const [{ mockCharities }, donationsMod] = await Promise.all([
      MOCK_MODULES.charities(),
      MOCK_MODULES.donations(),
    ]);

    const charity = mockCharities.find((c: any) => c.id === charityId);
    if (!charity) {
      const msg = `Unknown charityId: ${charityId}`;
      logger.warn(`DonateRoute: ${msg}`, 'DonateRoute');
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    // Convert to dollars
    const amountInDollars = Number((amountInCents / 100).toFixed(2));

    // Calculate split: 95% charity, 5% platform
    const platformFee = Number((amountInDollars * 0.05).toFixed(2));
    const charityAmount = Number((amountInDollars - platformFee).toFixed(2));

    // Calculate impact using charity's impactRate
    const impactRate = Number(charity?.impactRate || 0);
    const impactMetric = charity?.impactMetric ? String(charity.impactMetric) : undefined;
    const impact = Math.round(charityAmount * impactRate);

    logger.info(
      `Donate: ${amountInDollars}$ → ${charity.name} = ${impact} ${impactMetric ?? 'impact'}`,
      'DonateRoute'
    );

    // Simulate processing
    await sleep(1500);

    // Dynamic insights (not hardcoded)
    // Keep compatibility with your existing generator signatures:
    // - generateDynamicInsights(amountInDollars, charity, impact)
    // - or generateMockInsights(charityId, amountInDollars)
    let insights: any[] = [];
    const { generateDynamicInsights, generateMockInsights } = donationsMod as any;

    if (typeof generateDynamicInsights === 'function') {
      insights = await generateDynamicInsights(amountInDollars, charity, impact);
    } else if (typeof generateMockInsights === 'function') {
      insights = await generateMockInsights(charityId, amountInDollars);
    }

    const response: DonateResponse = {
      success: true,
      transactionId: `txn_mock_${Date.now()}`,
      charity: {
        id: charity.id,
        name: charity.name,
        emoji: charity.emoji,
      },
      amount: amountInDollars,
      platformFee,
      charityAmount,
      impact,
      impactMetric,
      insights,
      note,
    };

    logger.info(
      `DonateRoute: processed txn=${response.transactionId} charity=${charityId} amount=$${amountInDollars} impact=${impact}`,
      'DonateRoute'
    );
    return NextResponse.json(response, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || 'Donation processing failed';
    logger.error(`DonateRoute: ${msg}`, 'DonateRoute');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function validate(body?: DonatePayload): string | null {
  if (!body || typeof body !== 'object') return 'Missing request body';
  const { charityId, amountInCents } = body;
  if (!charityId || typeof charityId !== 'string') return 'charityId is required';
  if (
    amountInCents === undefined ||
    amountInCents === null ||
    typeof amountInCents !== 'number' ||
    Number.isNaN(amountInCents)
  )
    return 'amountInCents must be a number';
  if (amountInCents <= 0) return 'amountInCents must be greater than 0';
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// --- 157 lines --- Oct 16, 2025
