/**
 * app/onboarding/amount/page.tsx
 * Onboarding flow - Step 2: Donation Amount Selection
 * Allows users to select donation amount and see impact preview.
 */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCharities, processDonation } from '@/utils/api';
import { Charity } from '@/utils/types';
import { logger } from '@/utils/prettyLogs';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import AmountSelector from '@/components/onboarding/AmountSelector';
import TransparencyBreakdown from '@/components/onboarding/TransparencyBreakdown';
import ImpactPreview from '@/components/onboarding/ImpactPreview';
import Button from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';

function AmountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const charityId = searchParams.get('charity');

  const [charity, setCharity] = useState<Charity | null>(null);
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCharity() {
      if (!charityId) {
        logger.warn('No charity ID provided, redirecting to onboarding', 'AmountPage');
        router.push('/onboarding');
        return;
      }

      logger.info(`Loading charity: ${charityId}`, 'AmountPage');
      try {
        const charities = await getCharities();
        const selected = charities.find(c => c.id === charityId);
        if (selected) {
          logger.info(`Loaded charity: ${selected.name}`, 'AmountPage');
          setCharity(selected);
        } else {
          logger.warn(`Charity not found: ${charityId}`, 'AmountPage');
          router.push('/onboarding');
        }
      } catch (error) {
        logger.error(`Failed to load charity: ${error}`, 'AmountPage');
        console.error('Failed to load charity:', error);
        router.push('/onboarding');
      }
    }

    loadCharity();
  }, [charityId, router]);

  const handleDonate = async () => {
    if (!charity) return;

    logger.info(`Processing donation: $${amount} to ${charity.name}`, 'AmountPage');
    setLoading(true);
    try {
      const result = await processDonation(charity.id, amount);
      logger.info(`Donation successful: ${result.transactionId}`, 'AmountPage');
      router.push(`/onboarding/success?txn=${result.transactionId}`);
    } catch (error) {
      logger.error(`Donation failed: ${error}`, 'AmountPage');
      console.error('Donation failed:', error);
      alert('Donation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!charity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={2} totalSteps={3} />

      <div className="bg-white rounded-lg p-4 border border-border-default">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={charity.name}>
            {charity.emoji}
          </span>
          <div>
            <h3 className="text-lg font-bold text-text-primary">{charity.name}</h3>
            <p className="text-sm text-text-secondary">{charity.description}</p>
          </div>
        </div>
      </div>

      <AmountSelector selectedAmount={amount} onAmountChange={setAmount} />

      <ImpactPreview amount={amount} charity={charity} />

      <TransparencyBreakdown amount={amount} />

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          fullWidth
          onClick={handleDonate}
          disabled={loading || amount <= 0}
        >
          {loading ? (
            'Processing...'
          ) : (
            <>
              <Sparkles className="w-5 h-5 inline mr-2" />
              Donate & See AI Insights
            </>
          )}
        </Button>

        <Link href="/onboarding">
          <Button variant="ghost" fullWidth>
            Back
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AmountPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    }>
      <AmountPageContent />
    </Suspense>
  );
}
