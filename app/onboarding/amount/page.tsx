'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabaseBrowserClient from '@/src/lib/supabaseBrowserClient';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
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

  useEffect(() => {
    setAmount(22);
    setNote('');
    setError(null);
    setLoading(false);
  }, [charityId]);

  const handleBack = () => router.back();

  async function submitDonation({ charityId, amount, note }: { charityId: string; amount: number; note?: string }) {
    const { data: sessionData } = await supabaseBrowserClient.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('no_auth_token');

    const resp = await fetch('/api/donate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ charityId, amount, note: note ?? '' }),
    });

    const json = await resp.json();
    return { resp, json };
  }

  async function handleConfirm(e?: React.MouseEvent) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setError(null);
    if (!charityId) {
      setError('No charity selected');
      return;
    }
    setLoading(true);
    try {
      const { resp, json } = await submitDonation({ charityId, amount, note });
      if (!resp.ok || !json?.ok) {
        const msg = json?.error || json?.details || 'donation_failed';
        setError(msg);
        logger.warn('onboarding.amount: donate failed', 'onboarding');
        setLoading(false);
        return;
      }

      try {
        if (runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch {
        logger.debug('onboarding.amount: runtimeStore update skipped', 'onboarding');
      }

      try { localStorage.setItem('hasOnboarded', '1'); } catch {}

      setAmount(22);
      setNote('');

      router.replace('/dashboard');
    } catch (err: any) {
      logger.error('onboarding.amount: unexpected error', 'onboarding', err);
      setError(String(err?.message ?? err));
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
// 125 lines --- Oct 23
