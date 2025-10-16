/**
 * Path: src/mocks/transactions.ts
 * Purpose: Supply Mock transaction data for dashboard preview 
 */

import { Transaction } from '@/src/utils/types';

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'send',
    amount: 50.00,
    date: new Date('2025-10-16'),
    description: 'Lunch split',
    status: 'completed',
    recipient: 'Jordan Lee',
  },
  {
    id: 'txn-2',
    type: 'receive',
    amount: 25.00,
    date: new Date('2025-10-13'),
    description: 'Concert tickets',
    status: 'completed',
    recipient: 'Steve Chen',
  },
  {
    id: 'txn-3',
    type: 'donation',
    amount: 10.00,
    date: new Date('2025-10-05'),
    description: 'World Food Program USA',
    status: 'completed',
  },
];

/**
option: Fetch from API
to use real data, you can fetch from /api/transactions in a client component:

'use client';
import { useEffect, useState } from 'react';
import { Transaction } from '@/src/utils/types';
import RecentActivity from '@/src/components/dashboard/RecentActivity';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    }

    fetchTransactions();
  }, []);

  return <RecentActivity transactions={transactions} />;
}
*/