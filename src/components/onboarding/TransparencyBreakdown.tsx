// src/components/onboarding/TransparencyBreakdown.tsx

import Card from '@/src/components/ui/Card';

interface TransparencyBreakdownProps {
  amount: number;
}

export default function TransparencyBreakdown({ amount }: TransparencyBreakdownProps) {
  const charityAmount = amount * 0.95;
  const platformFee = amount * 0.05;

  return (
    <Card className="bg-background-secondary">
      <h3 className="text-base font-bold text-text-primary mb-4">
        Your ${amount.toFixed(2)} donation
      </h3>

      <div className="space-y-3">
        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="bg-brand-success" style={{ width: '95%' }} />
          <div className="bg-brand-primary" style={{ width: '5%' }} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">To charity:</span>
            <span className="text-sm font-bold text-text-primary">
              ${charityAmount.toFixed(2)} (95%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Platform fee:</span>
            <span className="text-sm font-bold text-text-primary">
              ${platformFee.toFixed(2)} (5%)
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
