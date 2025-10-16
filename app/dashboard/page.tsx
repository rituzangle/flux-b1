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

import { useEffect, useState } from 'react';
import { logger } from '@/src/utils/prettyLogs';
import BalanceCard from '@/src/components/dashboard/BalanceCard';
import QuickActions from '@/src/components/dashboard/QuickActions';
import RecentActivity from '@/src/components/dashboard/RecentActivity';
import { fetchTransactions, fetchUser } from '@/src/utils/api';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      logger.info('Dashboard: loading user + transactions', 'DashboardPage');
      try {
        const user = await fetchUser(true); // toggle to false for real API
        const tx = await fetchTransactions(true);

        if (!cancelled) {
          setBalance(user?.balance ?? 0);
          setTransactions(tx ?? []);
          logger.debug(
            `Dashboard: loaded balance=${user?.balance}, txCount=${tx?.length}`,
            'DashboardPage'
          );
        }
      } catch (e: any) {
        const msg = e?.message || 'Failed to load dashboard data';
        logger.error(`Dashboard: ${msg}`, 'DashboardPage');
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-text-secondary">Loading dashboard…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-brand-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      <BalanceCard balance={balance} />
      <QuickActions />
      <RecentActivity transactions={transactions} />
    </main>
  );
}
