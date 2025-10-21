/* 
Path: app/api/donate/route.ts
Purpose: ensure donate mutates runtimeStore, computes insight from charity + amount, and returns updated user + recent transactions.
*/// app/api/donate/route.ts// app/api/send/route.ts
import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type SendBody = { recipientId?: string; recipientName?: string; amount: number | string; note?: string; userId?: string; };

function toNumber(val: number | string) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as SendBody | null;
    if (!body) {
      logger.warn('send: invalid request', 'send');
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const amount = Math.max(0, toNumber(body.amount));
    if (amount <= 0) {
      return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });
    }

    const user = runtimeStore?.user ?? null;
    if (!user) {
      logger.warn('send: no runtime user', 'send');
      return NextResponse.json({ ok: false, error: 'no_user' }, { status: 500 });
    }

    const before = Number(user.balance ?? 0);
    user.balance = Math.max(0, +(before - amount).toFixed(2));

    runtimeStore.transactions = runtimeStore.transactions || [];
    const tx = {
      id: `tx-send-${Date.now()}`,
      userId: user.id,
      type: 'send',
      counterpartyId: body.recipientId ?? null,
      counterpartyName: body.recipientName ?? null,
      amount: Number(amount),
      note: body.note ?? null,
      timestamp: new Date().toISOString(),
    };

    runtimeStore.transactions.unshift(tx);
    if (runtimeStore.transactions.length > 200) runtimeStore.transactions.length = 200;

    logger.info(`send: user ${user.id} sent $${amount}`, 'send');

    return NextResponse.json({
      ok: true,
      user: { ...user },
      tx,
      recent: runtimeStore.transactions.slice(0, 8),
    });
  } catch (err) {
    logger.error(`send: unexpected error ${String(err)}`, 'send');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
// --- 68 lines 
