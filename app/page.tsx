/**
 * app/page.tsx
 * 
 * Home page - intelligent router based on onboarding status
 * ✅ Checks for 'onboardingComplete' (matches your mock data)
 * ✅ Routes to /dashboard if complete
 * ✅ Routes to /onboarding if not
 * ✅ Handles errors gracefully
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUser } from '@/src/utils/api';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function routeUser() {
      logger.info('Checking onboarding status', 'HomePage');
      try {
        const user = await fetchUser();
        logger.debug(`Fetched user: ${JSON.stringify(user)}`, 'HomePage');

        // Check the exact property name in your mock data
        // Adjust 'onboardingComplete' if your mock uses 'hasCompletedOnboarding' or different name
        const isOnboarded = user?.onboardingComplete === true;

        if (isOnboarded) {
          logger.info('User has completed onboarding → /dashboard', 'HomePage');
          router.push('/dashboard');
        } else {
          logger.info('User new or incomplete onboarding → /onboarding', 'HomePage');
          router.push('/onboarding');
        }
      } catch (error) {
        logger.error(`Failed to fetch user profile: ${error}`, 'HomePage');
        // Fallback to onboarding on error
        router.push('/onboarding');
      } finally {
        setIsChecking(false);
      }
    }

    routeUser();
  }, [router]);

  // Loading UI while checking status
  if (isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="text-center space-y-4">
          {/* Animated loading spinner */}
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-[#e5e5e5] border-t-[#2563eb] rounded-full animate-spin"></div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#0a0a0a]">Welcome to Flux</h1>
            <p className="text-base text-[#525252]">Loading your experience...</p>
          </div>
        </div>
      </main>
    );
  }

  // This shouldn't show (router redirects immediately), but fallback just in case
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
      <p className="text-[#525252]">Redirecting...</p>
    </main>
  );
}
