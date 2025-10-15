/**
 * app/page.tsx
 * Home page component for the Flux application.
 * Shows welcome message and triggers onboarding redirect via Suspense.
 */

import { Suspense } from 'react';
import RedirectToOnboarding from './RedirectToOnboarding';

export const dynamic = 'force-dynamic';

export default function Home() {
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
      <Suspense fallback={null}>
        <RedirectToOnboarding />
      </Suspense>
    </main>
  );
}
