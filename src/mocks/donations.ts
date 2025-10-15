import { AIInsight, Charity } from '@/utils/types';
import { mockCharities } from './charities';

export function generateMockInsights(amount: number, charity: Charity): AIInsight[] {
  const insights: AIInsight[] = [];

  const annualPrediction = amount * 12;
  insights.push({
    icon: '📊',
    title: 'Predicted Annual Giving',
    value: `$${annualPrediction}/year`,
    description: 'Based on your first donation',
  });

  const hour = new Date().getHours();
  let pattern = 'evening giver';
  if (hour < 12) pattern = 'morning person';
  else if (hour < 17) pattern = 'afternoon donor';

  insights.push({
    icon: '⏰',
    title: 'Your Pattern',
    value: pattern,
    description: 'Most active giving time',
  });

  const similarCharities = mockCharities
    .filter(c => c.category === charity.category && c.id !== charity.id)
    .slice(0, 3);

  insights.push({
    icon: '💚',
    title: 'Cause Match',
    value: `${similarCharities.length} similar charities`,
    description: `Also support ${charity.category}`,
    actionLabel: 'Explore',
  });

  const avgDonation = 15;
  const percentile = Math.min(95, Math.round((amount / avgDonation) * 50));

  insights.push({
    icon: '🏆',
    title: 'Impact',
    value: `Top ${100 - percentile}% of donors`,
    description: 'Your generosity compared to others',
  });

  return insights;
}
