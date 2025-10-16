// src/components/onboarding/AmountSelector.tsx
'use client';

import { useState } from 'react';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

interface AmountSelectorProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
}

const QUICK_PICKS = [5, 10, 25, 50];

export default function AmountSelector({ selectedAmount, onAmountChange }: AmountSelectorProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleQuickPick = (amount: number) => {
    setCustomMode(false);
    setCustomValue('');
    onAmountChange(amount);
  };

  const handleCustom = () => {
    setCustomMode(true);
    setCustomValue(selectedAmount.toString());
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onAmountChange(numValue);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-base font-medium text-text-primary">
        Choose an amount
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_PICKS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickPick(amount)}
            className={`
              h-14 rounded-lg font-bold text-lg transition-all duration-200
              ${
                selectedAmount === amount && !customMode
                  ? 'bg-brand-primary text-white shadow-md scale-105'
                  : 'bg-white text-text-primary border-2 border-border-default hover:border-brand-primary hover:shadow-sm'
              }
            `}
          >
            ${amount}
          </button>
        ))}
      </div>

      {customMode ? (
        <Input
          type="number"
          isAmount
          value={customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="Enter amount"
          min="1"
          step="0.01"
          autoFocus
        />
      ) : (
        <Button variant="ghost" onClick={handleCustom} fullWidth>
          Enter custom amount
        </Button>
      )}
    </div>
  );
}
