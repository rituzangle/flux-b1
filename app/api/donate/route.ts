/* 
Path: app/api/donate/route.ts
Purpose: ensure donate mutates runtimeStore, computes insight from charity + amount, and returns updated user + recent transactions.
*/
// app/api/donate/route.ts
import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { getCharityById } from '@/src/services/charities';
import { logger } from '@/src/utils/prettyLogs';
import { buildTransaction, applyTransactionToStore } from '@/src/utils/transactions';

export const dynamic = 'force-dynamic';

type DonateBody = { charityId?: string; amount?: number | string; note?: string; userId?: string; };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as DonateBody | null;
    if (!body || !body.charityId) {
      logger.warn('donate: invalid request body', 'donate');
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const amount = typeof body.amount === 'undefined' ? 0 : Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      logger.warn('donate: invalid amount', 'donate');
      return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });
    }

    const charity = getCharityById(body.charityId);
    const charityName = charity?.name ?? null;

    const tx = buildTransaction({
      type: 'donation',
      entityId: body.charityId,
      entityName: charityName,
      amount,
      note: body.note ?? null,
      meta: { impactRate: charity?.impactRate, impactMetric: charity?.impactMetric },
      userId: undefined,
    });

    const result = applyTransactionToStore(tx, runtimeStore);

    // Compute a compact insights array for the response (safe, non-hardcoded)
    const insights: string[] = [];
    try {
      if (charity && Number(charity.impactRate)) {
        const rate = Number(charity.impactRate) || 1;
        const impactCount = Math.max(1, Math.floor(Number(tx.amount) / rate));
        const metric = charity.impactMetric ?? 'people';
        insights.push(`You helped ${impactCount} ${metric} with your gift to ${charityName}.`);
      }
    } catch {
      // ignore insight generation errors
    }

    logger.info(`donate: user ${result.user?.id ?? 'unknown'} donated $${tx.amount} to ${body.charityId}`, 'donate');

    return NextResponse.json({
      ok: true,
      user: { ...result.user },
      tx,
      recent: result.recent,
      insights,
    });
  } catch (err) {
    logger.error('donate: unexpected error ' + String(err), 'donate');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

// --- 84 lines 
