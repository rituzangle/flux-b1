/**
 * Path: src/utils/api.ts
 * Centralized API utilities. Supports real endpoints and mocks via useMock.
 */

import { API_ENDPOINTS, MOCK_MODULES } from '@/src/config/apiPaths';
import { logger } from '@/src/utils/prettyLogs';

// Charity list
export async function getCharities(useMock = true) {
  logger.info(`getCharities(useMock=${useMock})`, 'API');
  if (useMock) {
    const { mockCharities } = await MOCK_MODULES.charities();
    return mockCharities;
  }
  const res = await fetch(API_ENDPOINTS.charities, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch charities');
  return res.json();
}

// Donation processing
export async function processDonation(payload: {
  charityId: string;
  amount: number;
  note?: string;
}, useMock = true) {
  logger.info(
    `processDonation(${JSON.stringify(payload)}, useMock=${useMock})`,
    'API'
  );

  if (useMock) {
    const { generateMockInsights } = await MOCK_MODULES.donations();
    const insights = generateMockInsights(payload.charityId, payload.amount);
    return { success: true, insights };
  }

  const res = await fetch(API_ENDPOINTS.donate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Donation failed');
  return data;
}

// User profile
export async function fetchUser(useMock = true) {
  logger.info(`fetchUser(useMock=${useMock})`, 'API');
  if (useMock) {
    const { mockUser } = await MOCK_MODULES.user();
    return mockUser;
  }
  const res = await fetch(API_ENDPOINTS.userProfile, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

// Transactions
export async function fetchTransactions(useMock = true) {
  logger.info(`fetchTransactions(useMock=${useMock})`, 'API');
  if (useMock) {
    const { mockTransactions } = await MOCK_MODULES.transactions();
    return mockTransactions;
  }
  const res = await fetch(API_ENDPOINTS.transactions, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}
