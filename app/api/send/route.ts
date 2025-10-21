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
import { buildTransaction, applyTransactionToStore } from '@/src/utils/transactions';

export const dynamic = 'force-dynamic';

type SendBody = { recipientId?: string; recipientName?: string; amount?: number | string; note?: string; userId?: string; };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as SendBody | null;
    if (!body || typeof body.amount === 'undefined') {
      logger.warn('send: invalid request body', 'send');
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      logger.warn('send: invalid amount', 'send');
      return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });
    }

    const recipientName = body.recipientName ?? null;

    const tx = buildTransaction({
      type: 'send',
      entityId: body.recipientId ?? null,
      entityName: recipientName,
      amount,
      note: body.note ?? null,
      meta: {},
      userId: undefined,
    });

    const result = applyTransactionToStore(tx, runtimeStore);

    logger.info(`send: user ${result.user?.id ?? 'unknown'} sent $${tx.amount} to ${recipientName || body.recipientId}`, 'send');

    return NextResponse.json({
      ok: true,
      user: { ...result.user },
      tx,
      recent: result.recent,
    });
  } catch (err) {
    logger.error('send: unexpected error ' + String(err), 'send');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
// --- 60 lines --- Oct 20, 2025
