import { Charity } from '@/utils/types';
import Card from '@/components/ui/Card';
import { Check } from 'lucide-react';

interface CharityCardProps {
  charity: Charity;
  selected: boolean;
  onSelect: () => void;
}

export default function CharityCard({ charity, selected, onSelect }: CharityCardProps) {
  return (
    <Card
      variant="selectable"
      selected={selected}
      onClick={onSelect}
      className="relative hover:scale-[1.02] transition-transform"
    >
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="text-5xl" role="img" aria-label={charity.name}>
          {charity.emoji}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-text-primary">{charity.name}</h3>
            {charity.verified && (
              <div className="flex items-center gap-1 text-xs text-brand-success">
                <Check className="w-3 h-3" />
                <span>Verified</span>
              </div>
            )}
          </div>
          <p className="text-sm text-text-secondary">{charity.description}</p>
        </div>

        <div className="text-xs text-text-secondary">
          {charity.donorCount.toLocaleString()} donors
        </div>
      </div>
    </Card>
  );
}
