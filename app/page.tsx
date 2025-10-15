/**
 * app/page.tsx
 * Home page component for the Flux application.
 * Entry point for authenticated users.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { logger } from '@/utils/prettyLogs';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    logger.info('Redirecting to onboarding in 3 seconds', 'HomePage');
    const timer = setTimeout(() => {
      router.push('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-md py-xl">
        <h1 className="text-3xl font-bold text-text-primary mb-md">
          Welcome to Flux
        </h1>
        <p className="text-base text-text-secondary">
          Your Next.js application is running successfully.
        </p>
        <p className="text-sm text-text-secondary mt-md">
          Redirecting to onboarding...
        </p>
      </div>
    </main>
  );
}
