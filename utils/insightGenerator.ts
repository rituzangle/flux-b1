/**
 * Donation Insight Generator
 * 
 * @file src/utils/insightGenerator.ts
 * 
 * Generates personalized AI insights from:
 * - Donation amount
 * - Charity impact metrics
 * - User behavior patterns (time of day, day of week)
 */

import type { Charity, AIInsight } from './types';

/**
 * Generate 4 dynamic AI insights from a donation
 * 
 * REPLACES: "You helped feed 10 children today."
 * WITH: Dynamic insights based on actual charity data
 */
export function generateDynamicInsights(
  amountInDollars: number,
  charity: Charity,
  impact: number
): AIInsight[] {
  const insights: AIInsight[] = [];

  // INSIGHT 1: Impact (uses charity's actual metric)
  const impactContext = getImpactNarrative(charity.impactMetric, impact);
  insights.push({
    icon: '📊',
    title: 'Your Impact',
    value: `${impact} ${charity.impactMetric}`,
    description: impactContext,
  });

  // INSIGHT 2: Predicted annual giving
  const annualAmount = Math.round(amountInDollars * 12);
  insights.push({
    icon: '💰',
    title: 'Annual Giving (if monthly)',
    value: `$${annualAmount}/year`,
    description: 'Your potential impact at this rate',
  });

  // INSIGHT 3: Giving moment (time-based pattern)
  const now = new Date();
  const hour = now.getHours();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  let givingStyle = 'Evening giver 🌙';
  if (hour < 12) givingStyle = 'Morning person ☀️';
  else if (hour < 17) givingStyle = 'Afternoon donor 🌤️';

  insights.push({
    icon: '⏰',
    title: 'Your Giving Style',
    value: givingStyle,
    description: `You gave on a ${dayName}`,
  });

  // INSIGHT 4: Donor impact percentile
  const avgDonation = 15; // Mock average
  const percentile = Math.max(1, Math.min(99, Math.round((amountInDollars / avgDonation) * 50)));

  insights.push({
    icon: '🏆',
    title: 'Donor Percentile',
    value: `Top ${100 - percentile}%`,
    description: 'More generous than most givers',
  });

  return insights;
}

/**
 * Convert impact numbers to human narratives
 * "20 meals" → "That's 3 days of food for a family"
 */
function getImpactNarrative(metric: string, count: number): string {
  const narratives: Record<string, (n: number) => string> = {
    meals: (n) => {
      if (n < 10) return 'That\'s a quick meal';
      if (n < 50) return `That's ${Math.floor(n / 3)} days of meals for a family`;
      return 'That\'s a week+ of meals';
    },
    'children supported': (n) =>
      n === 1 ? 'One child\'s life improved' : `${n} children get support`,
    'people helped': (n) =>
      n === 1 ? 'One person directly helped' : `${n} lives directly impacted`,
    'school days funded': (n) =>
      `${n} school ${n === 1 ? 'day' : 'days'} of education`,
    'care packages': (n) =>
      n === 1 ? 'One care package delivered' : `${n} care packages delivered`,
    'families helped': (n) =>
      n === 1 ? 'One family gets aid' : `${n} families receive help`,
  };

  const narrative = narratives[metric];
  return narrative ? narrative(count) : `You contributed ${count} ${metric}`;
