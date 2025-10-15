// app/api/donate/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/utils/prettyLogs';

export async function POST(req: Request) {
  const body = await req.json();
  logger.info(`Received donation: ${JSON.stringify(body)}`, 'DonateRoute');

  return NextResponse.json({
    success: true,
    transactionId: `txn_mock_${Date.now()}`,
    charity: { id: body.charityId },
    amount: body.amountInCents / 100,
    platformFee: (body.amountInCents * 0.05) / 100,
    charityAmount: (body.amountInCents * 0.95) / 100,
    impact: Math.floor((body.amountInCents / 100) * 2),
    insights: ['You helped feed 10 children today.'],
  });
}
