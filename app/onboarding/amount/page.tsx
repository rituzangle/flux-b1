/**
 * Path: app/onboarding/amount/page.tsx
 * Screen: Onboarding — Select donation amount and confirm
 * Behavior:
 * - Reads charityId from query string
 * - Loads charities to resolve selected charity details
 * - Validates amount and processes donation (mock/real via utils/api)
 * - Logs structured events for debugging
 * - Navigates forward to Dashboard on success; Back returns to choose-a-charity
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { logger } from '@/src/utils/prettyLogs';
import { getCharities, processDonation } from '@/src/utils/api';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';

export const dynamic = 'force-dynamic';

export default function OnboardingAmountPage() {
  const router = useRouter();
  const params = useSearchParams();

  const charityId = params.get('charityId') || '';
  const [charities, setCharities] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [error, setError] = useState('');

  // Resolve selected charity from loaded list
  const selectedCharity = useMemo(
    () => charities.find((c) => c.id === charityId),
    [charities, charityId]
  );

  // Load charities to render selected charity details
  useEffect(() => {
    let cancelled = false;
    async function loadCharities() {
      setLoadingCharities(true);
      setError('');
      logger.info('OnboardingAmount: loading charities', 'OnboardingAmount');
      try {
        // Use mocks for now; toggle to false when real API ready
        const list = await getCharities(true);
        if (!cancelled) {
          setCharities(list || []);
          logger.debug(
            `OnboardingAmount: loaded charities count=${(list || []).length}`,
            'OnboardingAmount'
          );
        }
      } catch (e: any) {
        const msg = e?.message || 'Unable to load charities.';
        logger.error(`OnboardingAmount: load charities failed: ${msg}`, 'OnboardingAmount');
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoadingCharities(false);
      }
    }
    loadCharities();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handlers
  const handleBack = () => {
    logger.info('OnboardingAmount: back to /onboarding', 'OnboardingAmount');
    router.push('/onboarding');
  };

  const handleConfirm = async () => {
    setError('');
    const amt = parseFloat(amount);
    if (!charityId) {
      setError('Please select a charity first.');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    logger.info(
      `OnboardingAmount: processDonation charityId=${charityId} amount=${amt}`,
      'OnboardingAmount'
    );

    try {
      // Use mocks for now; toggle to false when real API ready
      const result = await processDonation({ charityId, amount: amt, note }, true);
      logger.debug(
        `OnboardingAmount: donation result=${JSON.stringify(result)}`,
        'OnboardingAmount'
      );

      // Navigate to dashboard upon success
      logger.info('OnboardingAmount: success → /dashboard', 'OnboardingAmount');
      // after successful response (res)
      // revalidate server data (fetchUser, fetchTransactions)
      router.refresh(); 
      router.push('/dashboard');
    } catch (e: any) {
      const msg = e?.message || 'Donation failed. Please try again.';
      logger.error(`OnboardingAmount: donation failed: ${msg}`, 'OnboardingAmount');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Onboarding: Donation amount</h1>
        <p className="text-sm text-text-secondary">
          Choose how much to donate to your selected charity.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-background-secondary flex items-center justify-center">
              {/* logo if available */}
              {selectedCharity?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedCharity.logo}
                  alt={selectedCharity.name}
                  className="w-10 h-10 rounded"
                />
              ) : (
                <span className="text-sm text-text-secondary">Logo</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-text-primary truncate">
                {selectedCharity?.name || 'No charity selected'}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {selectedCharity?.tagline || 'Select a charity to preview impact'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              isAmount
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
            <Input
              label="Note (optional)"
              placeholder="Add a note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-brand-error rounded-md">
              <p className="text-sm text-brand-error">{error}</p>
            </div>
          )}

          {loadingCharities && (
            <div className="text-sm text-text-secondary">Loading charity details…</div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Processing…' : 'Confirm and continue'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-text-primary">Impact preview</h3>
          <p className="text-sm text-text-secondary">
            Your donation fuels real outcomes. You’ll see personalized impact after confirmation.
          </p>
        </div>
      </Card>
    </div>
  );
}
