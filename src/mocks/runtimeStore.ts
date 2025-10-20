/**
 * Path: src/mocks/runtimeStore.ts
 * In-memory runtime store for dev mode. Not persisted across restarts.
 Persistent mock state for APIs Create a small in-memory store file used by API routes so state persists for the running dev server.
 */
// src/mocks/runtimeStore.ts
import type { Charity, User } from '@/src/utils/types';
import { mockCharities } from '@/src//mocks/charities';

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

// 17 lines ---