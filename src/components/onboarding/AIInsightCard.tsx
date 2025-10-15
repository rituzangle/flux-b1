import { AIInsight } from '@/utils/types';
import Button from '@/components/ui/Button';

interface AIInsightCardProps {
  insight: AIInsight;
}

export default function AIInsightCard({ insight }: AIInsightCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-background-secondary transition-colors">
      <div className="text-3xl flex-shrink-0" role="img" aria-label={insight.title}>
        {insight.icon}
      </div>

      <div className="flex-grow">
        <h4 className="text-lg font-bold text-text-primary mb-1">
          {insight.title}
        </h4>
        <p className="text-base text-brand-primary font-medium mb-1">
          {insight.value}
        </p>
        <p className="text-sm text-text-secondary">
          {insight.description}
        </p>

        {insight.actionLabel && (
          <Button variant="ghost" className="mt-2 px-0 h-auto min-h-0">
            {insight.actionLabel} →
          </Button>
        )}
      </div>
    </div>
  );
}
