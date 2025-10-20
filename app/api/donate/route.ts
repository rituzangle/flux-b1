// app/api/donate/route.ts
import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { getCharityById } from '@/src/services/charities';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type DonateBody = { charityId: string; amount: number; note?: string; userId?: string; };

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
    if (!body || typeof body.amount !== 'number' || !body.charityId) {
      logger.warn('donate: invalid request', 'donate');
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const user = runtimeStore?.user ?? null;
    if (!user) {
      logger.warn('donate: no runtime user', 'donate');
      return NextResponse.json({ ok: false, error: 'no_user' }, { status: 500 });
    }

    const amount = Math.max(0, Number(body.amount));
    const before = Number(user.balance ?? 0);
    user.balance = Math.max(0, +(before - amount).toFixed(2));

    runtimeStore.transactions = runtimeStore.transactions || [];
    const tx = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      charityId: body.charityId,
      amount,
      note: body.note ?? null,
      timestamp: new Date().toISOString(),
      type: 'donation',
    };
    runtimeStore.transactions.unshift(tx);
    if (runtimeStore.transactions.length > 200) runtimeStore.transactions.length = 200;

    const charity = getCharityById(body.charityId);
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
// --- 67 lines 
