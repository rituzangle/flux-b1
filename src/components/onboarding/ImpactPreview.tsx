// src/components/onboarding/ImpactPreview.tsx
'use client';

import { useEffect, useState } from 'react';
import { Charity } from '@/src/utils/types';

interface ImpactPreviewProps {
  amount: number;
  charity: Charity;
}

export default function ImpactPreview({ amount, charity }: ImpactPreviewProps) {
  const targetImpact = Math.floor(amount * charity.impactRate);
  const [displayImpact, setDisplayImpact] = useState(0);

  useEffect(() => {
    const duration = 500;
    const steps = 20;
    const increment = targetImpact / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayImpact(targetImpact);
        clearInterval(timer);
      } else {
        setDisplayImpact(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [targetImpact]);

  const getImpactDescription = () => {
    const metric = charity.impactMetric;
    if (metric === 'meals') {
      const days = Math.floor(displayImpact / 3);
      return days > 0 ? `That's ${days} days of food for a family!` : '';
    }
    return `Making a real difference through ${charity.name}`;
  };

  return (
    <div className="text-center py-8 space-y-4">
      <div>
        <div className="text-3xl font-bold text-brand-primary mb-2">
          {displayImpact.toLocaleString()}
        </div>
        <div className="text-xl text-text-primary font-medium">
          {charity.impactMetric}
        </div>
      </div>

      {getImpactDescription() && (
        <p className="text-base text-text-secondary max-w-md mx-auto">
          {getImpactDescription()}
        </p>
      )}
    </div>
  );
}
