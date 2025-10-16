/**
 * app/send/page.tsx
 * Send Money Page
 * Allows users to send money to other Flux users.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/src/utils/prettyLogs';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { Send } from 'lucide-react';

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

    logger.info(`Send money initiated: recipient=${recipient}, amount=${amount}`, 'SendPage');

    if (!recipient || !amount) {
      const errorMsg = 'Please fill in all required fields';
      logger.warn(errorMsg, 'SendPage');
      setError(errorMsg);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      const errorMsg = 'Please enter a valid amount';
      logger.warn(errorMsg, 'SendPage');
      setError(errorMsg);
      return;
    }

    setLoading(true);
    logger.info(`Processing send: $${amountNum.toFixed(2)} to ${recipient}`, 'SendPage');

    setTimeout(() => {
      logger.info('Send transaction completed successfully', 'SendPage');
      alert(`Sent $${amountNum.toFixed(2)} to ${recipient}`);
      router.push('/');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Send Money</h1>
        <p className="text-base text-text-secondary">
          Send money to friends and family instantly
        </p>
      </div>

      <Card>
        <form onSubmit={handleSend} className="space-y-6">
          <Input
            label="Recipient"
            placeholder="Enter name, email, or phone"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />

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
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {error && (
            <div className="p-4 bg-red-50 border border-brand-error rounded-lg">
              <p className="text-sm text-brand-error font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-5 h-5 inline mr-2" />
                  Send ${amount || '0.00'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-text-primary">
            Instant transfers, no fees
          </h3>
          <p className="text-sm text-text-secondary">
            Send money to anyone with Flux instantly. No hidden charges.
          </p>
        </div>
      </Card>
    </div>
  );
}
