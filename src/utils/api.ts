/**
 * Path: src/utils/api.ts
 * Centralized API utilities for fetching user, charities, donations, and transactions.
 * Uses API_ENDPOINTS for production and MOCK_MODULES for local development/testing.
 */

import { API_ENDPOINTS, MOCK_MODULES } from '@/src/config/apiPaths';
import { logger } from '@/src/utils/prettyLogs';

/**
 * Fetch user profile (real API or mock).
 */
export async function fetchUser(useMock = false) {
  logger.info(`Fetching user profile (mock=${useMock})`, 'UserService');
  if (useMock) {
    const { mockUser } = await MOCK_MODULES.user();
    return mockUser;
  }

  const res = await fetch(API_ENDPOINTS.userProfile);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

/**
 * Fetch charities (real API or mock).
 */
export async function fetchCharities(useMock = false) {
  logger.info(`Fetching charities (mock=${useMock})`, 'CharityService');
  if (useMock) {
    const { mockCharities } = await MOCK_MODULES.charities();
    return mockCharities;
  }

  const res = await fetch(API_ENDPOINTS.charities);
  if (!res.ok) throw new Error('Failed to fetch charities');
  return res.json();
}

/**
 * Fetch donation insights (real API or mock).
 */
export async function fetchInsights(useMock = false) {
  logger.info(`Fetching donation insights (mock=${useMock})`, 'InsightsService');
  if (useMock) {
    const { generateMockInsights } = await MOCK_MODULES.donations();
    return generateMockInsights();
  }

  const res = await fetch(API_ENDPOINTS.donate);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}

/**
 * Fetch transactions (real API or mock).
 */
export async function fetchTransactions(useMock = false) {
  logger.info(`Fetching transactions (mock=${useMock})`, 'TransactionService');
  if (useMock) {
    const { mockTransactions } = await MOCK_MODULES.transactions();
    return mockTransactions;
  }

  const res = await fetch(API_ENDPOINTS.transactions);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}
