// app/onboarding/amount/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { runtimeStore } from '@/mocks/runtimeStore';
import { logger } from '@/utils/prettyLogs';

export default function OnboardingAmountPage() {
  const router = useRouter();
  const params = useSearchParams();
  const charityId = params?.get('charityId') ?? '';
  const [amount, setAmount] = useState<number>(22);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset to defaults whenever the selected charity changes
    setAmount(22);
    setNote('');
    setError(null);
    setLoading(false);
  }, [charityId]);

  const handleBack = () => {
    // Use replace so back after a navigation won't resubmit
    router.back();
  };

  async function handleConfirm(e?: React.MouseEvent) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
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

      // Apply response to runtimeStore (dev-only)
      try {
        if (runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch {
        logger.debug('onboarding.amount: runtimeStore update skipped', 'onboarding');
      }

      // Reset local form to defaults so Back/forward don't reuse previous values
      setAmount(22);
      setNote('');

      // Navigate to dashboard using replace to avoid leaving a page that can re-submit
      router.replace('/dashboard');
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
            <Button variant="outline" onClick={handleBack} type="button">Back</Button>
            <Button onClick={handleConfirm} disabled={loading} type="button">
              {loading ? 'Processing…' : 'Confirm and continue'}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
// --- 116 --- Oct 20
