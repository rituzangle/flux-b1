// src/services/charities.ts
// Tolerant loader for mock charities used in both Node scripts and Next runtime.
// Tries multiple import/require paths and accepts either named export `mockCharities` or `charities`.
// Keeps runtimeStore as the authoritative runtime override when present.

import type { Charity } from '@/src/utils/types';
import { runtimeStore } from '@/src/mocks/runtimeStore';

// Helper: try to load the mock module via ESM import or CommonJS require with multiple fallbacks.
// This avoids breakage when alias paths or module shapes change across environments.
function loadMockModule(): { mockList: Charity[] } {
  // First try direct ES imports (TypeScript/Next alias)
  try {
    const m = require('@/src/mocks/charities');
    const list = (m && (m.mockCharities ?? m.charities)) || [];
    return { mockList: list as Charity[] };
  } catch (e1) {
    // Try relative path from project root CommonJS
    try {
      const m2 = require('@/src/mocks/charities');
      const list2 = (m2 && (m2.mockCharities ?? m2.charities)) || [];
      return { mockList: list2 as Charity[] };
    } catch (e2) {
      // Try alternative relative path used by some workflows
      try {
        const m3 = require('@/src//mocks/charities');
        const list3 = (m3 && (m3.mockCharities ?? m3.charities)) || [];
        return { mockList: list3 as Charity[] };
      } catch (e3) {
        // Nothing found — return empty list
        return { mockList: [] };
      }
    }
  }
}

const { mockList } = loadMockModule();

export function listCharities(): Charity[] {
  const rs = (runtimeStore as any)?.charities;
  if (Array.isArray(rs) && rs.length > 0) return rs as Charity[];
  return (mockList || []) as Charity[];
}

export function getCharityById(id?: string): Charity | undefined {
  if (!id) return undefined;
  return listCharities().find((c) => c.id === id);
}
