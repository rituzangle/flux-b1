/**
 * Path: app/onboarding/page.tsx
 * Purpose: Charity selection screen in onboarding flow
 * Features: Error fallback, hover tooltips, dynamic routing
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Charity } from '@/src/utils/types';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCharities() {
      logger.info('Fetching charities for onboarding', 'Onboarding');
      try {
        const { mockCharities } = await import('@/src/mocks/charities');
        if (!mockCharities || mockCharities.length === 0) {
          throw new Error('No charities found in mock data');
        }
        setCharities(mockCharities);
        logger.debug(`Loaded ${mockCharities.length} charities`, 'Onboarding');
      } catch (err) {
        logger.error(`Failed to load charities: ${err}`, 'Onboarding');
        setError('Unable to load charities. Please try again later.');
      }
    }

    fetchCharities();
  }, []);

  const handleContinue = () => {
    if (!selectedCharityId) {
      logger.warn('No charity selected on continue', 'Onboarding');
      return;
    }
    logger.info(`Continuing with charity: ${selectedCharityId}`, 'Onboarding');
    router.push(`/onboarding/amount?charityId=${selectedCharityId}`);
  };

  const handleSkip = () => {
    logger.info('User skipped onboarding', 'Onboarding');
    router.push('/dashboard');
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a Charity</h1>

      {error ? (
        <div className="text-red-600 font-medium mb-6">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {charities.map(charity => (
            <button
              key={charity.id}
              onClick={() => setSelectedCharityId(charity.id)}
              title={charity.description}
              className={`border rounded-lg p-4 text-left transition-shadow hover:shadow-md ${
                selectedCharityId === charity.id ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              {/* <img src={charity.logo} alt={charity.name} className="h-12 mb-2" /> */}
              <img src={c.logo} alt={c.name} className="w-8 h-8 object-contain rounded" />
              <h2 className="text-lg font-semibold">{charity.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{charity.description}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleContinue}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!selectedCharityId}
        >
          Continue
        </button>
        <button
          onClick={handleSkip}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Skip for now
        </button>
      </div>
    </main>
  );
}
