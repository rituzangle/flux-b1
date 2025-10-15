export interface Charity {
  id: string;
  name: string;
  description: string;
  website: string | null;
  logoUrl: string;
  emoji: string;
  verified: boolean;
  donorCount: number;
  impactMetric: string;
  impactRate: number;
  category: 'hunger' | 'humanitarian' | 'emergency' | 'children';
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  hasCompletedOnboarding: boolean;
  firstDonationDate: Date | null;
  totalDonated: number;
  lastWWPromptShown: Date | null;
  wwPromptDismissedForPayday: boolean;
}

export interface AIInsight {
  icon: string;
  title: string;
  value: string;
  description: string;
  actionLabel?: string;
}

export interface DonationResult {
  success: boolean;
  transactionId: string;
  charity: Charity;
  amount: number;
  platformFee: number;
  charityAmount: number;
  impact: number;
  insights: AIInsight[];
}

export interface Transaction {
  id: string;
  type: 'donation' | 'send' | 'receive';
  amount: number;
  date: Date;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  recipient?: string;
  charity?: Charity;
}

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'disabled';
export type CardVariant = 'default' | 'elevated' | 'selectable' | 'glass';
export type WWPromptMode = 'prominent' | 'subtle' | 'hidden';
