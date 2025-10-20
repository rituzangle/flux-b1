// src/mocks/runtimeStore.ts
// In-memory runtime store for dev mode. Not persisted across restarts.
// Provides a seeded user, transactions, and a reference to the mock charities.

import type { Charity, User } from '@/utils/types';
import { mockCharities } from '@/mocks/charities';

export const runtimeStore: {
  user: User | null;
  transactions: any[];
  charities: Charity[];
} = {
  user: {
    id: 'user_dev_1',
    name: 'Dev User',
    email: 'dev@example.test',
    balance: 1250.0,
    hasCompletedOnboarding: false,
    firstDonationDate: null,
    totalDonated: 0,
    lastWWPromptShown: null,
    wwPromptDismissedForPayday: false,
  } as User,
  transactions: [],
  charities: mockCharities as Charity[],
};

export function applySeed(seed: Partial<typeof runtimeStore>) {
  if (!seed) return;
  if (seed.user) runtimeStore.user = { ...((runtimeStore.user as User) || {}), ...seed.user } as User;
  if (Array.isArray(seed.transactions)) runtimeStore.transactions = seed.transactions;
  if (Array.isArray(seed.charities)) runtimeStore.charities = seed.charities as Charity[];
}
