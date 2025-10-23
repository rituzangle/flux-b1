/**
 * Path: app/dashboard/page.tsx
 * Main Dashboard page — post‑onboarding home
 * Features:
 * - Displays user balance
 * - Shows quick actions (Send, Donate, Request)
 * - Lists recent activity
 * - Loads data via utils/api with mock/real toggle
 * - Structured logging for observability
 */
'use client';
import React from 'react';
import Card from '@/src/components/ui/Card';
import BalanceCard from '@/src/components/dashboard/BalanceCard';
import QuickActions from '@/src/components/dashboard/QuickActions';
import RecentActivity from '@/src/components/dashboard/RecentActivity';

/**
 * Minimal Dashboard page that assembles existing dashboard components.
 * This prevents router.replace('/dashboard') from 404-ing and provides
 * a stable landing after onboarding completes.
 */
export default function DashboardPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Home</h1>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <div className="md:col-span-2">
          <Card>
            <BalanceCard />
          </Card>
        </div>

        <div>
          <Card>
            <QuickActions />
          </Card>
        </div>
      </section>

      <section>
        <Card>
          <h2 className="text-lg font-semibold mb-2">Recent activity</h2>
          <RecentActivity />
        </Card>
      </section>
    </main>
  );
}
// 66 lines --- Oct 23
