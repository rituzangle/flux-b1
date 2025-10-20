// src/services/charities.ts
import type { Charity } from '@/utils/types';
import * as mockModule from '@/mocks/charities';
import { runtimeStore } from '@/mocks/runtimeStore';

const packagedMockCharities: Charity[] =
  (mockModule as any).mockCharities ?? (mockModule as any).charities ?? [];

export function listCharities(): Charity[] {
  const rs = (runtimeStore as any)?.charities;
  if (Array.isArray(rs) && rs.length > 0) return rs as Charity[];
  return packagedMockCharities as Charity[];
}

export function getCharityById(id?: string): Charity | undefined {
  if (!id) return undefined;
  return listCharities().find((c) => c.id === id);
}
