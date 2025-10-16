/**
 * Path: src/mocks/runtimeStore.ts
 * In-memory runtime store for dev mode. Not persisted across restarts.
 */

import { mockCharities } from './charities';
import { mockUser } from './user';
import { mockTransactions } from './transactions';

export const runtimeStore = {
  charities: [...mockCharities], // shallow copy
  user: { ...mockUser },
  transactions: [...mockTransactions],
};
