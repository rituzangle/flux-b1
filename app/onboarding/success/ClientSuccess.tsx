// app/onboarding/success/ClientSuccess.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';

export default function ClientSuccess({ redirectTo, amount, charityId }: { redirectTo: string; amount: string; charityId: string | null }) {
  const router = useRouter();

  useEffect(() => {
    // any client-only side effects (analytics, focus) go here
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold">Success</h1>
        <p className="mt-3 text-sm">Thank you — your donation{amount ? ` of $${Number(amount).toFixed(2)}` : ''} {charityId ? `to ${charityId}` : ''} is being processed.</p>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => router.push(redirectTo)} type="button">Back</Button>
          <Button onClick={() => router.push('/dashboard')} type="button">Continue to app</Button>
        </div>
      </Card>
    </main>
  );
}
// --- 29 lies --- Oct 23
