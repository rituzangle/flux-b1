/**
 * Path: src/utils/api.ts
 * Purpose: Single source of truth for Flux data fetches (user, charities, donations, transactions).
 * Design:
 * - Real endpoints via API_ENDPOINTS (production-ready)
 * - Mocks via MOCK_MODULES (static import map returning promises)
 * - Toggle each function with `useMock` boolean to switch behavior
 * - Structured logging for observability
 */

import { API_ENDPOINTS, MOCK_MODULES } from '@/src/config/apiPaths';
import { logger } from '@/src/utils/prettyLogs';

// Load charities (mock or real)
export async function getCharities(useMock = true) {
  logger.info(`API.getCharities(useMock=${useMock})`, 'API');
  if (useMock) {
    const { mockCharities } = await MOCK_MODULES.charities();
    logger.debug(`API.getCharities: mock count=${mockCharities.length}`, 'API');
    return mockCharities;
  }
  const res = await fetch(API_ENDPOINTS.charities, { cache: 'no-store' });
  if (!res.ok) {
    const msg = `Charities API failed: ${res.status}`;
    logger.error(msg, 'API');
    throw new Error(msg);
  }
  const data = await res.json();
  logger.debug(`API.getCharities: real count=${(data || []).length}`, 'API');
  return data;
}

// Process donation (mock or real)
export async function processDonation(
  payload: { charityId: string; amount: number; note?: string },
  useMock = true
) {
  logger.info(
    `API.processDonation(charityId=${payload.charityId}, amount=${payload.amount}, useMock=${useMock})`,
    'API'
  );

  if (useMock) {
    const { generateMockInsights } = await MOCK_MODULES.donations();
    const insights = generateMockInsights(payload.charityId, payload.amount);
    const result = { success: true, insights };
    logger.debug(`API.processDonation: mock result=${JSON.stringify(result)}`, 'API');
    return result;
  }

  const res = await fetch(API_ENDPOINTS.donate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || `Donation API failed: ${res.status}`;
    logger.error(msg, 'API');
    throw new Error(msg);
  }
  logger.debug(`API.processDonation: real result=${JSON.stringify(data)}`, 'API');
  return data;
}

// Fetch user profile (mock or real)
export async function fetchUser(useMock = true) {
  logger.info(`API.fetchUser(useMock=${useMock})`, 'API');
  if (useMock) {
    const { mockUser } = await MOCK_MODULES.user();
    logger.debug(`API.fetchUser: mock user=${JSON.stringify(mockUser)}`, 'API');
    return mockUser;
  }
  const res = await fetch(API_ENDPOINTS.userProfile, { cache: 'no-store' });
  if (!res.ok) {
    const msg = `UserProfile API failed: ${res.status}`;
    logger.error(msg, 'API');
    throw new Error(msg);
  }
  const data = await res.json();
  logger.debug(`API.fetchUser: real user=${JSON.stringify(data)}`, 'API');
  return data;
}

// Fetch transactions (mock or real)
export async function fetchTransactions(useMock = true) {
  logger.info(`API.fetchTransactions(useMock=${useMock})`, 'API');
  if (useMock) {
    const { mockTransactions } = await MOCK_MODULES.transactions();
    logger.debug(
      `API.fetchTransactions: mock count=${(mockTransactions || []).length}`,
      'API'
    );
    return mockTransactions;
  }
  const res = await fetch(API_ENDPOINTS.transactions, { cache: 'no-store' });
  if (!res.ok) {
    const msg = `Transactions API failed: ${res.status}`;
    logger.error(msg, 'API');
    throw new Error(msg);
  }
  const data = await res.json();
  logger.debug(`API.fetchTransactions: real count=${(data || []).length}`, 'API');
  return data;
}
