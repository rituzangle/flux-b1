/**
 * Path: src/mocks/runtimeStore.ts
 * In-memory runtime store for dev mode. Not persisted across restarts.
 Persistent mock state for APIs Create a small in-memory store file used by API routes so state persists for the running dev server.
 */

import { mockCharities } from './charities';
import { mockUser } from './user';
import { mockTransactions } from './transactions';

export const runtimeStore = {
  charities: [...mockCharities], // shallow copy
  user: { ...mockUser },
  transactions: [...mockTransactions],
};

// 17 lines ---