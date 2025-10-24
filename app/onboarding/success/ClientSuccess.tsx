// app/onboarding/success/ClientSuccess.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '@/src/components/ui/ProgressIndicator';
import AIInsightCard from '@/src/components/onboarding/AIInsightCard';
import Button from '@/src/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import { DonationResult } from '@/src/utils/types';
import { logger } from '@/src/utils/prettyLogs';

/**
 * ClientSuccess
 * - Client-only UI and effects for the onboarding success screen.
 * - Keeps third-party analytics and heavy effects minimal during auth/magic-link debugging.
 * - Props are simple serialized values provided by the server wrapper page.tsx.
 */
export default function ClientSuccess({
  txnId,
  redirectTo,
  amount,
  charityId,
}: {
  txnId: string | null;
  redirectTo: string;
  amount: string;
  charityId: string | null;
}) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [donationData, setDonationData] = useState<DonationResult | null>(null);

  useEffect(() => {
    if (!txnId) {
      logger.warn('No transaction ID provided, redirecting to onboarding', 'SuccessPage');
      router.push('/onboarding');
      return;
    }

    logger.info(`Donation success page loaded for transaction: ${txnId}`, 'SuccessPage');

    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [txnId, router]);

  useEffect(() => {
    // Minimal, deterministic data hydration: fetch transaction if API available,
    // otherwise fall back to generated preview so UI is deterministic in dev.
    async function hydrate() {
      try {
        // Try to fetch the actual donation result from the API first.
        if (txnId) {
          try {
            const resp = await fetch(`/api/transactions?txn=${encodeURIComponent(txnId)}`, { cache: 'no-store' });
            if (resp.ok) {
              const json = await resp.json();
              if (json?.ok && Array.isArray(json?.transactions) && json.transactions.length > 0) {
                const tx = json.transactions[0];
                const result: DonationResult = {
                  success: true,
                  transactionId: tx.id ?? String(txnId),
                  charity: {
                    id: tx.entity_id ?? (charityId ?? 'charity-unknown'),
                    name: tx.entity_name ?? 'Unknown Charity',
                    description: tx.meta?.description ?? '',
                    emoji: tx.meta?.emoji ?? '💚',
                    verified: !!tx.meta?.verified,
                    donorCount: tx.meta?.donorCount ?? 0,
                    impactMetric: tx.meta?.impactMetric ?? 'units',
                    impactRate: tx.meta?.impactRate ?? 0,
                    category: tx.meta?.category ?? 'general',
                  },
                  amount: Number(tx.amount ?? Number(amount ?? 0)),
                  platformFee: Number((tx.meta?.platformFee ?? 0)),
                  charityAmount: Number((tx.meta?.charityAmount ?? (Number(tx.amount ?? 0) - (tx.meta?.platformFee ?? 0)))),
                  impact: Number(tx.meta?.impact ?? Math.floor((Number(tx.amount ?? 0) * (tx.meta?.impactRate ?? 0)))),
                  insights: tx.insights ?? [],
                };
                setDonationData(result);
                logger.info('Hydrated donation data from /api/transactions', 'SuccessPage');
                return;
              }
            }
            logger.info('Transaction fetch returned no data, falling back to local mock', 'SuccessPage');
          } catch (e) {
            logger.warn('Transaction fetch failed, falling back to mock data', 'SuccessPage');
          }
        }

        // Fallback mock donation data for UI when API not available or during dev
        const fallbackAmount = Number(amount) || 10;
        const fallbackImpactRate = 2;
        const mockDonationData: DonationResult = {
          success: true,
          transactionId: txnId ?? `local-${Date.now()}`,
          charity: {
            id: charityId ?? 'charity-1',
            name: 'World Food Program USA',
            description: 'Fighting hunger worldwide',
            emoji: '🌍',
            verified: true,
            donorCount: 127543,
            impactMetric: 'meals',
            impactRate: fallbackImpactRate,
            category: 'hunger',
          },
          amount: fallbackAmount,
          platformFee: 0.5,
          charityAmount: Math.max(0, fallbackAmount - 0.5),
          impact: Math.floor(fallbackAmount * fallbackImpactRate),
          insights: [
            {
              icon: '📊',
              title: 'Predicted Annual Giving',
              value: `$${(fallbackAmount * 12).toFixed(0)}/year`,
              description: 'Based on your first donation',
            },
            {
              icon: '⏰',
              title: 'Your Pattern',
              value: 'morning person',
              description: 'Most active giving time',
            },
            {
              icon: '💚',
              title: 'Cause Match',
              value: '3 similar charities',
              description: 'Also support hunger',
              actionLabel: 'Explore',
            },
            {
              icon: '🏆',
              title: 'Impact',
              value: 'Top 35% of donors',
              description: 'Your generosity compared to others',
            },
          ],
        };

        setDonationData(mockDonationData);
        logger.info('Set fallback donation data for Success screen', 'SuccessPage');
      } catch (err) {
        logger.error(`Failed to hydrate donation data: ${String(err)}`, 'SuccessPage');
      }
    }

    hydrate();
  }, [txnId, amount, charityId]);

  const handleExplore = () => {
    logger.info('User navigating to main app', 'SuccessPage');
    router.push(redirectTo || '/');
  };

  return (
    <div className="space-y-6 relative">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-9xl animate-bounce">🎉</div>
        </div>
      )}

      <ProgressIndicator currentStep={3} totalSteps={3} />

      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-success rounded-full">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Amazing!</h1>
          <p className="text-lg text-text-secondary">
            {donationData ? `Donated to ${donationData.charity.name}` : 'Processing your donation...'}
          </p>
        </div>
      </div>

      {donationData && (
        <>
          <div className="bg-brand-success bg-opacity-10 rounded-lg p-6 text-center">
            <p className="text-2xl font-bold text-brand-success mb-2">
              {donationData.impact} {donationData.charity.impactMetric}
            </p>
            <p className="text-base text-text-secondary">
              Your ${donationData.amount.toFixed(2)} donation provides this impact!
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              What Our AI Learned About You
            </h2>

            <div className="space-y-2">
              {donationData.insights.map((insight, index) => (
                <AIInsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        </>
      )}

      <Button variant="primary" fullWidth onClick={handleExplore}>
        Explore Flux
      </Button>
    </div>
  );
}
