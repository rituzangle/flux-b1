// src/services/charities.ts
import type { Charity } from '@/utils/types';
import { mockCharities } from '@/mocks/charities';
import { runtimeStore } from '@/mocks/runtimeStore';

export function listCharities(): Charity[] {
  const rs = (runtimeStore as any)?.charities;
  if (Array.isArray(rs) && rs.length > 0) return rs as Charity[];
  return mockCharities as Charity[];
}

export function getCharityById(id?: string): Charity | undefined {
  if (!id) return undefined;
  return listCharities().find((c) => c.id === id);
}
