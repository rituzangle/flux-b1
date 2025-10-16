/**
 * Path: app/request/page.tsx
 * Screen: Request Funds
 * Features:
 * - Placeholder content until request flow is implemented
 * - Escape routes: back to dashboard or previous page
 */

'use client';

import { useRouter } from 'next/navigation';
import Button from '@/src/components/ui/Button';

export const dynamic = 'force-dynamic';

export default function RequestPage() {
  const router = useRouter();

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Request Funds</h1>
      <p className="text-base text-text-secondary">
        This page is under construction. Soon you’ll be able to request money from friends and family.
      </p>

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    </main>
  );
}
