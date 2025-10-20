/**
 * Path: app/api/send/route.ts
 * POST /api/send
 * - Validates payload
 * - Creates a transaction and updates runtimeStore.user.balance
 * - Returns { success, transaction, user }
 Update send route: create transaction + update balance
 */
// app/api/send/route.ts
import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type SendBody = {
  recipientId?: string;
  recipientName?: string;
  amount: number;
  note?: string;
  userId?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as SendBody | null;
    if (!body || typeof body.amount !== 'number' || body.amount <= 0) {
      logger.warn('send: invalid request body', 'send');
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const user = (runtimeStore && runtimeStore.user) || null;
    if (!user) {
      logger.warn('send: no runtime user', 'send');
      return NextResponse.json({ error: 'no_user' }, { status: 500 });
    }

    const amount = Math.max(0, Number(body.amount));
    const before = Number(user.balance ?? 0);
    const after = Math.max(0, +(before - amount).toFixed(2));
    user.balance = after;

    runtimeStore.transactions = runtimeStore.transactions || [];

    const tx = {
      id: `tx-send-${Date.now()}`,
      userId: user.id,
      type: 'send',
      counterpartyId: body.recipientId || null,
      counterpartyName: body.recipientName || null,
      amount,
      note: body.note || null,
      timestamp: new Date().toISOString(),
    };

    // newest first
    runtimeStore.transactions.unshift(tx);
    if (runtimeStore.transactions.length > 200) runtimeStore.transactions.length = 200;

    logger.info(`send: user ${user.id} sent $${amount} to ${body.recipientName || body.recipientId || 'unknown'}`, 'send');

    return NextResponse.json({
      ok: true,
      user: { ...user },
      tx,
      recent: runtimeStore.transactions.slice(0, 8),
    });
  } catch (err) {
    logger.error(`send: unexpected error ${String(err)}`, 'send');
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// --- 49 lines --- Oct 16, 2025
