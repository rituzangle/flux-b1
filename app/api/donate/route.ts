/* 
Path: app/api/donate/route.ts
Purpose: ensure donate mutates runtimeStore, computes insight from charity + amount, and returns updated user + recent transactions.
*/// app/api/donate/route.ts
import { NextResponse } from 'next/server';
import { runtimeStore } from '@/mocks/runtimeStore';
import { getCharityById } from '@/services/charities';
import { logger } from '@/utils/prettyLogs';
import { buildTransaction, applyTransactionToStore } from '@/utils/transactions';

export const dynamic = 'force-dynamic';

type DonateBody = { charityId: string; amount: number | string; note?: string; userId?: string; };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as DonateBody | null;
    if (!body || !body.charityId) {
      logger.warn('donate: invalid request', 'donate');
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const charity = getCharityById(body.charityId);
    const charityName = charity?.name ?? null;

    const tx = buildTransaction({
      type: 'donation',
      entityId: body.charityId,
      entityName: charityName,
      amount: body.amount,
      note: body.note ?? null,
      meta: { impactRate: charity?.impactRate, impactMetric: charity?.impactMetric },
      userId: undefined,
    });

    const result = applyTransactionToStore(tx, runtimeStore);

    logger.info(`donate: user ${result.user?.id ?? 'unknown'} donated $${tx.amount} to ${body.charityId}`, 'donate');

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    logger.error('donate: unexpected ' + String(err), 'donate');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

// --- 84 lines 
