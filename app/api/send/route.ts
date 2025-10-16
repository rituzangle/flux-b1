/**
 * Path: app/api/send/route.ts
 * POST /api/send
 * - Validates payload
 * - Creates a transaction and updates runtimeStore.user.balance
 * - Returns { success, transaction, user }
 */

import { NextResponse } from 'next/server';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';

type SendPayload = { recipient: string; amount: number; note?: string };

export async function POST(req: Request) {
  let body: SendPayload | undefined;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { recipient, amount, note } = body || {};
  if (!recipient || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Simulate processing
  await new Promise((r) => setTimeout(r, 800));

  const transaction = {
    id: `txn_${Date.now()}`,
    type: 'send',
    to: recipient,
    amount,
    note: note || '',
    createdAt: new Date().toISOString(),
  };

  runtimeStore.transactions.unshift(transaction);

  if (typeof runtimeStore.user.balance === 'number') {
    runtimeStore.user.balance = Number((runtimeStore.user.balance - amount).toFixed(2));
    if (runtimeStore.user.balance < 0) runtimeStore.user.balance = 0;
  }

  logger.info(`SendAPI: sent $${amount} to ${recipient}`, 'SendAPI');
  return NextResponse.json({ success: true, transaction, user: runtimeStore.user }, { status: 200 });
}
// --- 49 lines --- Oct 16, 2025
