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
// app/dashboard/page.tsx
'use client';
import React from 'react';
import BalanceCard from '@/src/components/dashboard/BalanceCard';
import RecentActivity from '@/src/components/dashboard/RecentActivity';
import QuickActions from '@/src/components/dashboard/QuickActions';
import Card from '@/src/components/ui/Card';
import { runtimeStore } from '@/src/mocks/runtimeStore';

/**
 * Dashboard page
 * - Minimal, reversible composition of existing dashboard components.
 * - Reads runtimeStore for dev-time display and renders client components for interactive pieces.
 * - Does not mutate state or change APIs.
 */

export default function DashboardPage() {
  const user = (runtimeStore && runtimeStore.user) ?? null;
  const recent = Array.isArray(runtimeStore?.transactions) ? runtimeStore.transactions.slice(0, 50) : [];

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <BalanceCard user={user} />
        </div>

        <div className="md:col-span-2">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <RecentActivity transactions={recent} />
        </div>

        <div>
          <Card>
            <h3 className="font-medium">AI Insights</h3>
            <div className="mt-3 text-sm text-muted-foreground space-y-2">
              {/* Lightweight insight rendering from recent transactions and user totals */}
              <div>
                <strong>Total donated</strong>{' '}
                <span className="text-slate-700">${(user?.totalDonated ?? 0).toFixed(2)}</span>
              </div>
              <div>
                <strong>Recent giving</strong>{' '}
                <span className="text-slate-700">
                  {recent.filter((t: any) => t.type === 'donation').slice(0, 3).map((t: any) => `${t.entityName ?? t.entityId ?? 'Charity'} $${Number(t.amount).toFixed(0)}`).join('; ') || '—'}
                </span>
              </div>
              <div>
                <strong>Recommendation</strong>
                <div className="text-xs text-muted-foreground mt-2">
                  Consider a small recurring gift to a charity you recently supported to increase impact over time.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
// 76 lines --- oct 20
