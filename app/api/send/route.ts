/**
 * Path: app/api/send/route.ts
 * Endpoint: POST /api/send
 * Keeper logic preserved:
 * - Validates payload
 * - Returns structured response
 * - Leaves room for future persistence
 */

import { NextResponse } from 'next/server';
import { logger } from '@/src/utils/prettyLogs';

type SendPayload = { recipient: string; amount: number; note?: string };

export async function POST(req: Request) {
  let body: SendPayload | undefined;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { recipient, amount } = body || {};
  if (!recipient || typeof recipient !== 'string') {
    return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
  }
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
  }

  logger.info(`SendAPI: sending $${amount} to ${recipient}`, 'SendAPI');
  return NextResponse.json({ success: true, message: `Sent $${amount} to ${recipient}` }, { status: 200 });
}
