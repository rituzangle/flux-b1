/**
 * Path: app/send/page.tsx
 * Title: Send Money
 * Keeper logic: Same validation/UI; replaces alert with POST /api/send and redirects to dashboard
 */
// app/send/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabaseBrowserClient from '@/src/lib/supabaseBrowserClient';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { Send as SendIcon } from 'lucide-react';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';

/**
 * Send Money page
 * - Ensures a browser Supabase session exists before calling /api/send
 * - Attaches Authorization: Bearer <token> to the request
 * - Updates runtimeStore and navigates to /dashboard on success
 * - Redirects to /signin if the user is not authenticated
 */
export default function SendPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('sss');
  const [amount, setAmount] = useState<number>(20.9);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabaseBrowserClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsSignedIn(!!data.session);
      setSessionChecked(true);
    }).catch((e) => {
      logger.warn('send: session check failed', 'send', e);
      setSessionChecked(true);
    });
    return () => { mounted = false; };
  }, []);

  async function handleSend(e?: React.MouseEvent) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setError(null);

    if (!recipient) {
      setError('Please enter a recipient');
      return;
    }
    const amt = Number(amount || 0);
    if (amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Ensure signed-in session and get access token
    const { data: sessionData } = await supabaseBrowserClient.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      setError('You must sign in before sending money.');
      router.push('/signin');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientName: recipient, amount: amt, note }),
      });

      const json = await resp.json();
      if (!resp.ok || !json?.ok) {
        setError(json?.error || json?.details || 'send_failed');
        logger.warn('send: send failed', 'send', json);
        return;
      }

      // Update runtimeStore for dev UI
      try {
        if (runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch {
        logger.debug('send: runtimeStore update skipped', 'send');
      }

      // Clear form so Back/forward don't reuse old values
      setRecipient('');
      setAmount(0);
      setNote('');

      // Persist onboarding completion if it's part of the flow (safe no-op if already set)
      try { localStorage.setItem('hasOnboarded', '1'); } catch {}

      // Replace history entry to avoid resubmission on back
      router.replace('/dashboard');
    } catch (err: any) {
      setError(String(err?.message ?? err));
      logger.error('send: unexpected error', 'send', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Send money</h1>
          <SendIcon className="w-6 h-6 text-slate-500" />
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm">Recipient</label>
            <Input value={recipient} onChange={(e) => setRecipient((e.target as HTMLInputElement).value)} />
          </div>

          <div>
            <label className="block text-sm">Amount</label>
            <Input
              type="number"
              value={String(amount)}
              onChange={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
            />
          </div>

          <div>
            <label className="block text-sm">Note (optional)</label>
            <Input value={note} onChange={(e) => setNote((e.target as HTMLInputElement).value)} />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => router.back()} type="button">Cancel</Button>

            {!sessionChecked ? (
              <Button disabled type="button">Checking session…</Button>
            ) : !isSignedIn ? (
              <Button onClick={() => router.push('/signin')} type="button">Sign in to send</Button>
            ) : (
              <Button onClick={handleSend} disabled={loading} type="button">
                {loading ? 'Processing…' : `Send $${Number(amount || 0).toFixed(2)}`}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </main>
  );
}
/* 165 lines Oct 20 */
