/**
 * app/api/donate/route.ts
 * 
 * Donation processing endpoint
 * ✅ Uses dynamic insights (not hardcoded)
 * ✅ Uses mockCharities data (single source of truth for : list of charities)
 * ✅ Calculates impact from charity.impactRate
 * ✅ Returns AIInsight[] objects
 */

import { NextResponse } from 'next/server';
import { mockCharities } from '@/mocks/charities';
import { generateDynamicInsights } from '@/utils/insightGenerator';
import { logger } from '@/utils/prettyLogs';

interface DonateRequest {
  charityId: string;
  amountInCents: number; // e.g., 1000 = $10.00
}

export async function POST(req: Request) {
  try {
    const body: DonateRequest = await req.json();
    logger.info(`Donate: Received ${body.amountInCents / 100} to ${body.charityId}`, 'DonateRoute');

    // Validate
    if (!body.charityId || !body.amountInCents || body.amountInCents < 100) {
      logger.warn('Donate: Invalid amount', 'DonateRoute');
      return NextResponse.json(
        { success: false, error: 'Invalid amount (minimum $1.00)' },
        { status: 400 }
      );
    }

    // Find charity (single source of truth)
    const charity = mockCharities.find((c) => c.id === body.charityId);
    if (!charity) {
      logger.warn(`Donate: Charity not found: ${body.charityId}`, 'DonateRoute');
      return NextResponse.json(
        { success: false, error: 'Charity not found' },
        { status: 404 }
      );
    }

    // Convert to dollars
    const amountInDollars = body.amountInCents / 100;

    // Calculate split: 95% charity, 5% platform
    const platformFee = Number((amountInDollars * 0.05).toFixed(2));
    const charityAmount = Number((amountInDollars - platformFee).toFixed(2));

    // Calculate impact using charity's impactRate
    const impact = Math.round(charityAmount * charity.impactRate);

    logger.info(
      `Donate: ${amountInDollars}$ → ${charity.name} = ${impact} ${charity.impactMetric}`,
      'DonateRoute'
    );

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // DYNAMIC insights (not hardcoded)
    const insights = generateDynamicInsights(amountInDollars, charity, impact);

    const response = {
      success: true,
      transactionId: `txn_mock_${Date.now()}`,
      charity: {
        id: charity.id,
        name: charity.name,
        emoji: charity.emoji,
      },
      amount: amountInDollars,
      platformFee,
      charityAmount,
      impact,
      impactMetric: charity.impactMetric,
      insights, // AIInsight[] objects
    };

    logger.info('Donate: Success', 'DonateRoute');
    return NextResponse.json(response);
  } catch (error) {
    logger.error(`Donate: Error: ${error}`, 'DonateRoute');
    return NextResponse.json(
      { success: false, error: 'Donation processing failed' },
      { status: 500 }
    );
  }
}