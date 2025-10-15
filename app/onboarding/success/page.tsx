/**
 * app/onboarding/success/page.tsx
 * Onboarding flow - Step 3: Success Screen with AI Insights
 * Shows donation confirmation and AI-generated insights.
 */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateUserProfile } from '@/utils/api';
import { DonationResult } from '@/utils/types';
import { logger } from '@/utils/prettyLogs';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import AIInsightCard from '@/components/onboarding/AIInsightCard';
import Button from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txnId = searchParams.get('txn');

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
    async function completeOnboarding() {
      logger.info('Completing onboarding and generating AI insights', 'SuccessPage');
      try {
        await updateUserProfile({
          hasCompletedOnboarding: true,
          firstDonationDate: new Date(),
        });
        logger.info('User profile updated successfully', 'SuccessPage');

        const mockDonationData: DonationResult = {
          success: true,
          transactionId: txnId || '',
          charity: {
            id: 'charity-1',
            name: 'World Food Program USA',
            description: 'Fighting hunger worldwide',
            emoji: '🌍',
            verified: true,
            donorCount: 127543,
            impactMetric: 'meals',
            impactRate: 2,
            category: 'hunger',
          },
          amount: 10,
          platformFee: 0.50,
          charityAmount: 9.50,
          impact: 20,
          insights: [
            {
              icon: '📊',
              title: 'Predicted Annual Giving',
              value: '$120/year',
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

        logger.info('Generated AI insights for user', 'SuccessPage');
        setDonationData(mockDonationData);
      } catch (error) {
        logger.error(`Failed to complete onboarding: ${error}`, 'SuccessPage');
        console.error('Failed to complete onboarding:', error);
      }
    }

    completeOnboarding();
  }, [txnId]);

  const handleExplore = () => {
    logger.info('User navigating to main app', 'SuccessPage');
    router.push('/');
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
            {donationData
              ? `Donated to ${donationData.charity.name}`
              : 'Processing your donation...'}
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
