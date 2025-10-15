/**
 * app/RedirectToOnboarding.tsx
 * Client-side redirect to onboarding flow.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { logger } from '@/utils/prettyLogs';

export default function RedirectToOnboarding() {
  const router = useRouter();

  useEffect(() => {
    logger.info('Redirecting to onboarding in 3 seconds', 'RedirectToOnboarding');
    const timer = setTimeout(() => {
      router.push('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
