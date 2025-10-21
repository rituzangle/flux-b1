// src/mocks/runtimeStore.ts
// In-memory runtime store for dev mode. Not persisted across restarts.
// This file uses tolerant require fallbacks so Node scripts (logFlow.js) can load mocks
// even when TS path aliases or ESM imports are not available in the quick runtime.
// In-memory runtime store for dev mode.
// Works with both Next (ESM/TS imports) and plain Node require() by exposing CommonJS exports.
// Canonical in-memory runtime store for dev.
// Single source of truth exposed as both ESM export and attached to globalThis
// so every runtime (server handlers, client dev imports, node debug scripts)
// see and mutate the exact same object during local development.

import type { Charity, User } from '@/src/utils/types';

// tolerant loader for seed charities (won't throw)
function loadMockCharities(): Charity[] {
  try { // prefer Next alias (when used inside Next runtime)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@/src/mocks/charities');
    return (m && (m.mockCharities ?? m.charities ?? m.default)) || [];
  } catch (e1) {
    try {
      // fallback to relative source path
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m2 = require('@/src/mocks/charities');
      return (m2 && (m2.mockCharities ?? m2.charities ?? m2.default)) || [];
    } catch (e2) {
      try {
        // another fallback
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const m3 = require('@/src/mocks/charities');
        return (m3 && (m3.mockCharities ?? m3.charities ?? m3.default)) || [];
      } catch {
        return [];
      }
    }
  }
}

const seededCharities = loadMockCharities();

export type RuntimeStoreShape = {
  user: User | null;
  transactions: Array<any>;
  charities: Charity[];
};

function makeInitialStore(): RuntimeStoreShape {
  return {
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
}

// Use globalThis to ensure a single instance across module systems in dev.
// This avoids duplicate runtimeStore objects when files are required/imported
// with different resolvers during local development.
const GLOBAL_KEY = '__FLUX_DEV_RUNTIME_STORE__' as const;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface GlobalThis {
    [GLOBAL_KEY]?: RuntimeStoreShape;
  }
}

if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = makeInitialStore();
}

export const runtimeStore: RuntimeStoreShape = globalThis[GLOBAL_KEY] as RuntimeStoreShape;

export function applySeed(seed: Partial<RuntimeStoreShape>) {
  if (!seed) return;
  if (seed.user) runtimeStore.user = { ...((runtimeStore.user as User) || {}), ...seed.user } as User;
  if (Array.isArray(seed.transactions)) runtimeStore.transactions = seed.transactions;
  if (Array.isArray(seed.charities)) runtimeStore.charities = seed.charities;
}

// CommonJS compatibility for tools that use require() referencing this same file path.
// This line does not create a separate instance — it simply exposes the same object.
declare const module: any;
if (typeof module !== 'undefined' && module.exports) {
  try { module.exports = Object.assign(module.exports || {}, { runtimeStore, applySeed }); } catch {}
}

// --- 64 lines --- oct 20