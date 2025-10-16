// app/api/send/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/src/utils/prettyLogs';

export async function POST(req: Request) {
  const { recipient, amount, note } = await req.json();

  logger.info(`API received send request: $${amount} to ${recipient}`, 'SendAPI');

  if (!recipient || !amount || amount <= 0) {
    logger.warn('Invalid send request', 'SendAPI');
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Simulate transaction success
  return NextResponse.json({
    success: true,
    message: `Sent $${amount.toFixed(2)} to ${recipient}`,
  });
}
