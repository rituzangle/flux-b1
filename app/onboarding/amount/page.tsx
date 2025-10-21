// app/onboarding/amount/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/utils/prettyLogs';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';

export default function OnboardingAmountPage() {
  const router = useRouter();
  const params = useSearchParams();
  const charityId = params?.get('charityId') ?? '';
  const [amount, setAmount] = useState<number>(22);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure we reset amount if charityId changes or on mount to avoid stale previous values
  useEffect(() => {
    setNote('');
    setAmount(22);
    setError(null);
  }, [charityId]);

  const handleBack = () => router.back();

  async function handleConfirm() {
    setError(null);
    if (!charityId) {
      setError('No charity selected');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId, amount, note }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) {
        setError(json?.error || 'donation_failed');
        logger.warn('onboarding.amount: donate failed', 'onboarding');
        setLoading(false);
        return;
      }

      // Update runtimeStore (dev-only) so dashboard reacts quickly
      try {
        if (typeof runtimeStore !== 'undefined' && runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch (e) {
        logger.debug('onboarding.amount: runtimeStore update skipped', 'onboarding');
      }

      // Clear local form state to avoid reusing previous donation values
      setNote('');
      setAmount(22);

      logger.info('onboarding.amount: donation successful', 'onboarding');
      router.push('/dashboard');
    } catch (err) {
      setError(String(err));
      logger.error('onboarding.amount: unexpected error', 'onboarding');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold">Donation amount</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose how much to donate to your selected charity.</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={String(amount)}
              onChange={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
              min={0}
              step="0.01"
              className="w-40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Note (optional)</label>
            <Input value={note} onChange={(e) => setNote((e.target as HTMLInputElement).value)} />
          </div>

          {error && <div className="p-2 bg-red-50 text-red-800 rounded">{error}</div>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Processing…' : 'Confirm and continue'}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
// --- 111 --- Oct 20
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
// app/onboarding/amount/page.tsx
/* 
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';

export default function OnboardingAmountPage() {
  const router = useRouter();
  const params = useSearchParams();
  const charityId = params?.get('charityId') ?? '';
  const [amount, setAmount] = useState<number>(22);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure we reset amount if charityId changes or on mount to avoid stale previous values
  useEffect(() => {
    setNote('');
    setAmount(22);
    setError(null);
  }, [charityId]);

  const handleBack = () => router.back();

  async function handleConfirm() {
    setError(null);
    if (!charityId) {
      setError('No charity selected');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId, amount, note }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) {
        setError(json?.error || 'donation_failed');
        logger.warn('onboarding.amount: donate failed', 'onboarding');
        setLoading(false);
        return;
      }

      // Update runtimeStore (dev-only) so dashboard reacts quickly
      try {
        if (typeof runtimeStore !== 'undefined' && runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch (e) {
        logger.debug('onboarding.amount: runtimeStore update skipped', 'onboarding');
      }

      // Clear local form state to avoid reusing previous donation values
      setNote('');
      setAmount(22);

      logger.info('onboarding.amount: donation successful', 'onboarding');
      router.push('/dashboard');
    } catch (err) {
      setError(String(err));
      logger.error('onboarding.amount: unexpected error', 'onboarding');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold">Donation amount</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose how much to donate to your selected charity.</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={String(amount)}
              onChange={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
              min={0}
              step="0.01"
              className="w-40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Note (optional)</label>
            <Input value={note} onChange={(e) => setNote((e.target as HTMLInputElement).value)} />
          </div>

          {error && <div className="p-2 bg-red-50 text-red-800 rounded">{error}</div>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Processing…' : 'Confirm and continue'}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}

// --- 208 lines --- Oct 16, 2025
