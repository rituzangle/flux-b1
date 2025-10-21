/* 
Path: app/api/donate/route.ts
Purpose: ensure donate mutates runtimeStore, computes insight from charity + amount, and returns updated user + recent transactions.
*/
import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { getCharityById } from '@/src/services/charities';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type DonateBody = { charityId: string; amount: number | string; note?: string; userId?: string; };

function toNumber(val: number | string) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function makeInsight(charity: any, amount: number) {
  if (!charity) return 'Thank you for supporting this cause.';
  const rate = Number(charity.impactRate ?? 1) || 1;
  const impactCount = Math.max(1, Math.floor(amount / rate));
  const metric = charity.impactMetric ?? 'people';
  return `You helped ${impactCount} ${metric} with your gift to ${charity.name}.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as DonateBody | null;
    if (!body || !body.charityId) {
      logger.warn('donate: invalid request', 'donate');
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const user = runtimeStore?.user ?? null;
    if (!user) {
      logger.warn('donate: no runtime user', 'donate');
      return NextResponse.json({ ok: false, error: 'no_user' }, { status: 500 });
    }

    const amount = Math.max(0, toNumber(body.amount));
    if (amount <= 0) {
      return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });
    }

    const before = Number(user.balance ?? 0);
    user.balance = Math.max(0, +(before - amount).toFixed(2));

    runtimeStore.transactions = runtimeStore.transactions || [];

    const charity = getCharityById(body.charityId);
    const charityName = charity?.name ?? null;

    const tx = {
      id: `tx-donate-${Date.now()}`,
      userId: user.id,
      type: 'donation',
      charityId: body.charityId,
      charityName,
      amount: Number(amount),
      note: body.note ?? null,
      timestamp: new Date().toISOString(),
    };

    runtimeStore.transactions.unshift(tx);
    if (runtimeStore.transactions.length > 200) runtimeStore.transactions.length = 200;

    const insights = [makeInsight(charity, amount)];

    logger.info(`donate: user ${user.id} donated $${amount} to ${body.charityId}`, 'donate');

    return NextResponse.json({
      ok: true,
      user: { ...user },
      tx,
      recent: runtimeStore.transactions.slice(0, 8),
      insights,
    });
  } catch (err) {
    logger.error('donate: unexpected ' + String(err), 'donate');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

// --- 84 lines 
