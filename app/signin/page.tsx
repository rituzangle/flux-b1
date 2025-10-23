'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseBrowserClient from '@/src/lib/supabaseBrowserClient';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { logger } from '@/src/utils/prettyLogs';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e?: React.FormEvent) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      // inside handleMagicLink in app/signin/page.tsx
      const { error } = await supabaseBrowserClient.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth-callback` }
      });

      if (error) {
        setError(error.message);
        logger.warn('signin: magic link send failed', 'auth', error);
      } else {
        setMessage('Magic link sent. Check your inbox.');
        logger.info('signin: magic link sent', 'auth');
      }
    } catch (err: any) {
      setError(String(err?.message ?? err));
      logger.error('signin: unexpected error', 'auth', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a sign-in link.</p>

        <form className="mt-4 space-y-4" onSubmit={handleMagicLink}>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} type="email" />
          </div>

          {message && <div className="p-2 bg-green-50 text-green-800 rounded">{message}</div>}
          {error && <div className="p-2 bg-red-50 text-red-800 rounded">{error}</div>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} type="button">Back</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send sign-in link'}</Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
// --- Oct 23
