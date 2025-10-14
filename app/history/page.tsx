'use client';

import { useEffect, useState } from 'react';
import { getTransactions } from '@/utils/api';
import { Transaction } from '@/utils/types';
import { ArrowUpRight, ArrowDownLeft, HandHeart } from 'lucide-react';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'donation' | 'send' | 'receive'>('all');

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-6 h-6 text-brand-error" />;
      case 'receive':
        return <ArrowDownLeft className="w-6 h-6 text-brand-success" />;
      case 'donation':
        return <HandHeart className="w-6 h-6 text-brand-primary" />;
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredTransactions = transactions.filter(
    t => filter === 'all' || t.type === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Transaction History</h1>
        <p className="text-base text-text-secondary">View all your activity</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'donation', 'send', 'receive'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filter === filterType
                ? 'bg-brand-primary text-white'
                : 'bg-white text-text-secondary hover:bg-background-secondary'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-border-default hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-background-secondary flex items-center justify-center flex-shrink-0">
              {getIcon(transaction.type)}
            </div>

            <div className="flex-grow min-w-0">
              <p className="text-base font-bold text-text-primary truncate">
                {transaction.description}
              </p>
              <p className="text-sm text-text-secondary">
                {formatDate(transaction.date)}
                {transaction.recipient && ` • ${transaction.recipient}`}
              </p>
              <span
                className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded ${
                  transaction.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {transaction.status}
              </span>
            </div>

            <div className="text-lg font-bold text-text-primary">
              {transaction.type === 'receive' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
