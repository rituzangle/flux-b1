/**
 * app/page.tsx
 * Home page component for the Flux application.
 * Redirects to onboarding or dashboard based on user profile.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUser } from '@/utils/api';
import { logger } from '@/utils/prettyLogs';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      logger.info('Checking onboarding status', 'HomePage');
      try {
        const user = await fetchUser();
        logger.debug(`Fetched user: ${JSON.stringify(user)}`, 'HomePage');

        if (user?.onboardingComplete) {
          logger.info('User has completed onboarding. Redirecting to dashboard.', 'HomePage');
          router.push('/dashboard');
        } else {
          logger.info('User has not completed onboarding. Redirecting to onboarding.', 'HomePage');
          router.push('/onboarding');
        }
      } catch (error) {
        logger.error(`Failed to fetch user profile: ${error}`, 'HomePage');
        router.push('/onboarding'); // fallback
      }
    }

    routeUser();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Welcome to Flux</h1>
        <p className="text-base text-text-secondary">Loading your experience...</p>
      </div>
    </main>
  );
}
