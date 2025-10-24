/**
 * Path: app/send/page.tsx
 * Title: Send Money
 * Keeper logic: Same validation/UI; replaces alert with POST /api/send and redirects to dashboard
 */
// app/send/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Card from '@/src/components/ui/Card';
import { supabaseBrowserClient } from '@/src/lib/boltDatabaseClient';
import { logger } from '@/src/utils/prettyLogs';

export default function SendPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const num = Number(amount);
    if (!recipient) return setError('Recipient is required.');
    if (!Number.isFinite(num) || num <= 0) return setError('Enter a valid amount.');

    setLoading(true);

    try {
      // Ensure we have an up-to-date session and access token
      const { data: sessionData } = await supabaseBrowserClient.auth.getSession();
      const token = sessionData?.session?.access_token;
      logger.info('SendPage: session token preview', 'SendPage');
      if (!token) {
        // Save return target and redirect to signin
        try { sessionStorage.setItem('signin_redirect', window.location.pathname + window.location.search); } catch {}
        router.push(`/signin?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      // Prepare body
      const body = { recipient, amount: num, note: note || null };

      // Send with Authorization header
      const resp = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await resp.json().catch(() => null);

      // Debug logging to help pin server rejections
      logger.info('SendPage: /api/send response status', String(resp.status), 'SendPage');
      logger.info('SendPage: /api/send response body preview', JSON.stringify(json ?? { raw: 'no-json' }).slice(0, 1000), 'SendPage');

      if (!resp.ok) {
        const msg = json?.error || json?.details || `server_error_${resp.status}`;
        setError(String(msg));
        setLoading(false);
        return;
      }

      if (!json?.ok) {
        setError(String(json?.error || json?.details || 'invalid_request'));
        setLoading(false);
        return;
      }

      setResult(json);
      setLoading(false);
      router.push(`/onboarding/success?txn=${encodeURIComponent(json?.rpc?.tx?.id ?? '')}&amount=${encodeURIComponent(String(num))}`);
    } catch (err) {
      logger.error(`SendPage: unexpected error ${String(err)}`, 'SendPage');
      setError('unexpected_error');
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Send money</h1>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Recipient</label>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient sss" />
          </div>

          <div>
            <label className="block text-sm font-medium">Amount</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20.00" type="number" step="0.01" />
          </div>

          <div>
            <label className="block text-sm font-medium">Note (optional)</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="For lunch" />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/onboarding')}>Cancel</Button>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? 'Sending…' : `Send $${Number(amount || 0).toFixed(2)}`}
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-4 text-sm">
            <strong>Result:</strong> <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </Card>
    </main>
  );
}

/* 129 lines Oct 20 */
// backup app/send/page.tsx.bak
