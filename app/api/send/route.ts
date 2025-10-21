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

type SendBody = { recipientId?: string; recipientName?: string; amount: number | string; note?: string; userId?: string; };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as SendBody | null;
    if (!body || typeof body.amount === 'undefined') {
      logger.warn('send: invalid request', 'send');
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const tx = buildTransaction({
      type: 'send',
      entityId: body.recipientId ?? null,
      entityName: body.recipientName ?? null,
      amount: body.amount,
      note: body.note ?? null,
      meta: {},
      userId: undefined,
    });

    const result = applyTransactionToStore(tx, runtimeStore);

    logger.info(`send: user ${result.user?.id ?? 'unknown'} sent $${tx.amount} to ${body.recipientName || body.recipientId}`, 'send');

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    logger.error(`send: unexpected error ${String(err)}`, 'send');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

// --- 74 lines --- Oct 20, 2025
