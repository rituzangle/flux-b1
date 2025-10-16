// src/components/dashboard/RecentActivity.tsx

import { Transaction } from '@/src/utils/types';
import { ArrowUpRight, ArrowDownLeft, HandHeart } from 'lucide-react';

interface RecentActivityProps {
  transactions: Transaction[];
}

export default function RecentActivity({ transactions }: RecentActivityProps) {
  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-brand-error" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-brand-success" />;
      case 'donation':
        return <HandHeart className="w-5 h-5 text-brand-primary" />;
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text-primary">Recent Activity</h3>

      <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center flex-shrink-0">
              {getIcon(transaction.type)}
            </div>

            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {transaction.description}
              </p>
              <p className="text-xs text-text-secondary">
                {formatDate(transaction.date)}
              </p>
            </div>

            <div className="text-sm font-bold text-text-primary">
              {transaction.type === 'receive' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <p className="text-center text-text-secondary py-8">
            No transactions yet. Start by donating or sending money!
          </p>
        )}
      </div>
    </div>
  );
}
