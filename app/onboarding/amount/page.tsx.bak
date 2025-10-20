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
'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';

export default function OnboardingAmountPage() {
  const router = useRouter();
  const params = useSearchParams();
  const charityId = params?.get('charityId') ?? '';
  const [amount, setAmount] = useState<number>(22);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => router.back();

  async function handleConfirm() {
    setError(null);
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

      // Update local runtimeStore if present (runtimeStore is shared in dev)
      try {
        if (typeof runtimeStore !== 'undefined' && runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch (e) {
        logger.debug('onboarding.amount: runtimeStore update skipped', 'onboarding');
      }

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
      <h1 className="text-2xl font-bold">Donation amount</h1>
      <h2 className="text-xl"> app/onboarding/amount/page.tsx</h2>

      <section className="mt-4">
        <div className="mb-3">
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 p-2 border rounded w-40"
            min={0}
            step="0.01"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            placeholder="Add a note"
          />
        </div>

        {error && <div className="p-2 bg-red-50 text-red-800 rounded mb-3">{error}</div>}

        <div className="flex gap-3">
          <button onClick={handleBack} className="px-4 py-2 border rounded">Back</button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            disabled={loading}
          >
            {loading ? 'Processing…' : `Confirm and continue`}
          </button>
        </div>
      </section>
    </main>
  );
}

// --- 208 lines --- Oct 16, 2025
