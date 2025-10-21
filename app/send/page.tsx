/**
 * Path: app/send/page.tsx
 * Title: Send Money
 * Keeper logic: Same validation/UI; replaces alert with POST /api/send and redirects to dashboard
 */
// app/send/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { Send as SendIcon } from 'lucide-react';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';

export default function SendPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('sss');
  const [amount, setAmount] = useState<number>(20.9);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientName: recipient, amount, note }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) {
        setError(json?.error || 'send_failed');
        setLoading(false);
        return;
      }

      // Update runtimeStore locally (dev-only)
      try {
        if (typeof runtimeStore !== 'undefined' && runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch (e) {
        logger.debug('send: runtimeStore update skipped', 'send');
      }

      // Clear form to avoid stale values on back/forward
      setRecipient('');
      setAmount(0);
      setNote('');

      router.push('/dashboard');
    } catch (e) {
      setError(String(e));
      logger.error('send: unexpected error', 'send');
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
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Processing…' : `Send $${Number(amount || 0).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
// -- 106 - Oct 20
/*
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/src/utils/prettyLogs';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { Send as SendIcon } from 'lucide-react';
import { runtimeStore } from '@/src/mocks/runtimeStore';
export const dynamic = 'force-dynamic';
export default function SendPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('sss');
  const [amount, setAmount] = useState<number>(20.9);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientName: recipient, amount, note }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) {
        setError(json?.error || 'send_failed');
        setLoading(false);
        return;
      }

      // Update runtimeStore locally (dev-only)
      try {
        if (typeof runtimeStore !== 'undefined' && runtimeStore && runtimeStore.user) {
          runtimeStore.user = { ...json.user };
          runtimeStore.transactions = json.recent ?? runtimeStore.transactions ?? [];
        }
      } catch (e) {
        logger.debug('send: runtimeStore update skipped', 'send');
      }
      // Clear form to avoid stale values on back/forward
      setRecipient('');
      setAmount(0);
      setNote('');

      router.push('/dashboard');
    } catch (e) {
      setError(String(e));
      logger.error('send: unexpected error', 'send');
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
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Processing…' : `Send $${Number(amount || 0).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}*/
/* 89 lines Oct 16 12:03 AM */