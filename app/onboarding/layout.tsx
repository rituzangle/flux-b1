/**
 * app/onboarding/layout.tsx
 * Layout wrapper for onboarding flow.
 * Centers content and provides consistent spacing.
 */

export const dynamic = 'force-dynamic'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}
