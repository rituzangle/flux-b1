/**
 * Path: app/send/page.tsx
 * Title: Send Money
 * Keeper logic: Same validation/UI; replaces alert with POST /api/send and redirects to dashboard
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/src/utils/prettyLogs';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { Send } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SendPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    if (!recipient || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid recipient and amount.');
      return;
    }

    setLoading(true);
    logger.info(`Send: $${amountNum} to ${recipient}`, 'SendPage');

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, amount: amountNum, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Transaction failed');

      logger.info(`Send success: ${JSON.stringify(data)}`, 'SendPage');
      router.push('/dashboard');
    } catch (err: any) {
      logger.error(`Send failed: ${err.message}`, 'SendPage');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Send Money</h1>
      <h2 className="text-1xl font-bold text-text-primary">from app/send/page.tsx</h2>
      <p className="text-base text-text-secondary">Send money to friends and family instantly.</p>

      <Card>
        <form onSubmit={handleSend} className="space-y-6">
          <Input label="Recipient" placeholder="Enter name, email, or phone" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
          <Input label="Amount" type="number" isAmount placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" required />
          <Input label="Note (optional)" placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)} />

          {error && (
            <div className="p-4 bg-red-50 border border-brand-error rounded-lg">
              <p className="text-sm text-brand-error font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Sending…' : <><Send className="w-5 h-5 inline mr-2" />Send ${amount || '0.00'}</>}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
