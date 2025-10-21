// src/mocks/runtimeStore.ts
// In-memory runtime store for dev mode. Not persisted across restarts.
// This file uses tolerant require fallbacks so Node scripts (logFlow.js) can load mocks
// even when TS path aliases or ESM imports are not available in the quick runtime.

import type { Charity, User } from '@/src/utils/types';

// Helper to load mock charities with multiple fallbacks so both Node require() and
// Next's TS imports will resolve a usable array.
function loadMockCharities(): Charity[] {
  try {
    // Try TypeScript/Next alias import at runtime (this will work when compiled by Next)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@/src/mocks/charities');
    return (m && (m.mockCharities ?? m.charities)) || [];
  } catch (e1) {
    try {
      // Try relative path from project root
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m2 = require('./src/mocks/charities');
      return (m2 && (m2.mockCharities ?? m2.charities)) || [];
    } catch (e2) {
      try {
        // Try another common relative path
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const m3 = require('./src/mocks/charities');
        return (m3 && (m3.mockCharities ?? m3.charities)) || [];
      } catch (e3) {
        // Fallback: empty list
        return [];
      }
    }
  }
}

const seededCharities: Charity[] = loadMockCharities();

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
  charities: seededCharities,
};

export function applySeed(seed: Partial<typeof runtimeStore>) {
  if (!seed) return;
  if (seed.user) runtimeStore.user = { ...((runtimeStore.user as User) || {}), ...seed.user } as User;
  if (Array.isArray(seed.transactions)) runtimeStore.transactions = seed.transactions;
  if (Array.isArray(seed.charities)) runtimeStore.charities = seed.charities as Charity[];
}
// --- 64 lines --- oct 20