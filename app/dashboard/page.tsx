'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/src/utils/prettyLogs';
import BalanceCard from '@/src/components/dashboard/BalanceCard';
import QuickActions from '@/src/components/dashboard/QuickActions';
import RecentActivity from '@/src/components/dashboard/RecentActivity';
import { fetchTransactions } from '@/src/utils/api';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      logger.info('Loading dashboard data', 'DashboardPage');
      try {
        const txns = await fetchTransactions();
        setTransactions(txns);
        setBalance(1234.56); // Replace with real balance logic
        logger.debug(`Loaded ${txns.length} transactions`, 'DashboardPage');
      } catch (err) {
        logger.error(`Failed to load dashboard data: ${err}`, 'DashboardPage');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p className="p-6 text-center text-text-secondary">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      <BalanceCard balance={balance} />
      <QuickActions />
      <RecentActivity transactions={transactions} />
    </div>
  );
}
