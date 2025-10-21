// src/mocks/runtimeStore.ts
// In-memory runtime store for dev mode. Not persisted across restarts.
// This file uses tolerant require fallbacks so Node scripts (logFlow.js) can load mocks
// even when TS path aliases or ESM imports are not available in the quick runtime.
// src/mocks/runtimeStore.ts
// In-memory runtime store for dev mode.
// Works with both Next (ESM/TS imports) and plain Node require() by exposing CommonJS exports.

import type { Charity, User } from '@/src/utils/types';

// Tolerant loader: try multiple require/import paths to find the mock charities.
// Returns an array (possibly empty) and never throws.
function loadMockCharities(): Charity[] {
  try {
    // Try TS/Next alias (works inside Next runtime)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@/src/mocks/charities');
    return (m && (m.mockCharities ?? m.charities ?? m.default)) || [];
  } catch (e1) {
    try {
      // Try common relative path from project root
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m2 = require('./src/mocks/charities');
      return (m2 && (m2.mockCharities ?? m2.charities ?? m2.default)) || [];
    } catch (e2) {
      try {
        // Try other relative path used by some scripts
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const m3 = require('./src/mocks/charities');
        return (m3 && (m3.mockCharities ?? m3.charities ?? m3.default)) || [];
      } catch (e3) {
        // No mocks found — return empty array
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

// CommonJS compatibility so plain `require('src/mocks/runtimeStore')` works in Node scripts
declare const module: any;
if (typeof module !== 'undefined' && module.exports) {
  try {
    module.exports = Object.assign(module.exports || {}, { runtimeStore, applySeed });
  } catch {
    // ignore
  }
}

// --- 64 lines --- oct 20