/**
 * app/api/donate/route.ts
 * 
 * Donation processing endpoint
 * 
 * ✅ Uses dynamic insights (not hardcoded)
 * ✅ Uses actual charity data from mocks
 * ✅ Calculates impact from charity.impactRate
 * ✅ Returns AIInsight[] objects (not string array)
 */

import { NextResponse } from 'next/server';
import { mockCharities } from '@/mocks/charities';
import { generateDynamicInsights } from '@/utils/insightGenerator';
import { logger } from '@/utils/prettyLogs';

interface DonateRequest {
  charityId: string;
  amountInCents: number; // Amount in cents (e.g., 1000 = $10.00)
}

export async function POST(req: Request) {
  try {
    const body: DonateRequest = await req.json();
    logger.info(`Received donation: ${JSON.stringify(body)}`, 'DonateRoute');

    // Validate inputs
    if (!body.charityId || !body.amountInCents || body.amountInCents < 100) {
      logger.warn(`Invalid donation amount: ${body.amountInCents}`, 'DonateRoute');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid donation amount (minimum $1.00)',
        },
        { status: 400 }
      );
    }

    // Find charity from mock data (single source of truth)
    const charity = mockCharities.find((c) => c.id === body.charityId);
    if (!charity) {
      logger.warn(`Charity not found: ${body.charityId}`, 'DonateRoute');
      return NextResponse.json(
        {
          success: false,
          error: 'Charity not found',
        },
        { status: 404 }
      );
    }

    // Convert to dollars
    const amountInDollars = body.amountInCents / 100;

    // Calculate split: 95% to charity, 5% to platform
    const platformFee = Number((amountInDollars * 0.05).toFixed(2));
    const charityAmount = Number((amountInDollars - platformFee).toFixed(2));

    // Calculate impact using charity's impactRate
    // e.g., $10 * charity.impactRate(2) = 20 meals
    const impact = Math.round(charityAmount * charity.impactRate);

    logger.info(
      `Processing donation: $${amountInDollars} to ${charity.name} (impact: ${impact} ${charity.impactMetric})`,
      'DonateRoute'
    );

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate DYNAMIC insights using charity data
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
      insights, // Now AIInsight[] objects instead of strings
    };

    logger.info(`Donation successful: ${JSON.stringify(response)}`, 'DonateRoute');
    return NextResponse.json(response);
  } catch (error) {
    logger.error(
      `Donation error: ${error instanceof Error ? error.message : String(error)}`,
      'DonateRoute'
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Donation processing failed',
      },
      { status: 500 }
    );
  }
}
