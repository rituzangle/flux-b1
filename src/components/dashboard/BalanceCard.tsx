// src/components/dashboard/BalanceCard.tsx

import Card from '@/src/components/ui/Card';

interface BalanceCardProps {
  balance?: number;
}

export default function BalanceCard({ balance = 0 }: BalanceCardProps) {
  const formatted = `$${balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Card variant="glass" className="text-center">
      <div className="space-y-2">
        <p className="text-sm text-text-secondary font-medium">Available Balance</p>
        <p className="text-3xl font-bold text-text-primary">{formatted}</p>
      </div>
    </Card>
  );
}
