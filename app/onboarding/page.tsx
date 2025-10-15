/**
 * app/onboarding/page.tsx
 * Onboarding flow - Step 1: Charity Selection
 * Allows users to select a charity to donate to during onboarding.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCharities } from '@/utils/api';
import { Charity } from '@/utils/types';
import { logger } from '@/utils/prettyLogs';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import CharityCard from '@/components/onboarding/CharityCard';
import Button from '@/components/ui/Button';

export default function OnboardingPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCharities() {
      logger.info('Loading charities for onboarding', 'OnboardingPage');
      try {
        const data = await getCharities();
        logger.info(`Loaded ${data.length} charities`, 'OnboardingPage');
        setCharities(data);
      } catch (error) {
        logger.error(`Failed to load charities: ${error}`, 'OnboardingPage');
        console.error('Failed to load charities:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCharities();
  }, []);
const handleContinue = () => {
  if (selectedCharity) {
    logger.info(`User selected charity: ${selectedCharity}`, 'OnboardingPage');
    router.push(`/onboarding/amount?charity=${selectedCharity}`);
  } else {
    logger.info('No charity selected, redirecting to donate flow', 'OnboardingPage');
    router.push('/donate');
  }
};

  const handleSkip = () => {
  logger.info('User skipped onboarding, redirecting to /donate', 'OnboardingPage');
  router.push('/donate');
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">Loading charities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={1} totalSteps={3} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Welcome to Flux!</h1>
        <p className="text-lg text-text-secondary">
          Start by making a difference. Donate and see our AI in action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charities.map((charity) => (
          <CharityCard
            key={charity.id}
            charity={charity}
            selected={selectedCharity === charity.id}
            onSelect={() => setSelectedCharity(charity.id)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          fullWidth
          disabled={!selectedCharity}
          onClick={handleContinue}
        >
          Continue
        </Button>

        <button
          onClick={handleSkip}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
