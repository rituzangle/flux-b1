/**
 * Path: src/utils/api.ts
 * API utility functions for fetching data.
 * Handles both mock data and real API calls based on environment configuration.
 */
import { API_ENDPOINTS, MOCK_MODULES } from '@/src/config/apiPaths';
/* update this script later to use 'API_ENDPOINTS, MOCK_MODULES' etc. throughout the file.
*/
import { Charity, DonationResult, User, Transaction } from '@/src/utils/types';
import { logger } from '@/src/utils/prettyLogs';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Centralized API endpoints
const API_ENDPOINTS = {
  charities: '/api/charities',
  donate: '/api/donate',
  userProfile: '/api/user/profile',
  transactions: '/api/transactions',
};

// Centralized mock module paths
const MOCK_MODULES = {
  charities: '@/src/mocks/charities',
  donations: '@/src/mocks/donations',
  user: '@/src/mocks/user',
  transactions: '@/src/mocks/transactions',
};

/**
 * Fetches the list of available charities.
 */
export async function getCharities(): Promise<Charity[]> {
  logger.info('Fetching charities list', 'API');

  if (USE_MOCK) {
    logger.debug('Using mock charities data', 'API');
    const { mockCharities } = await import(MOCK_MODULES.charities);
    logger.debug(`Loaded mockCharities:\n${JSON.stringify(mockCharities, null, 2)}`, 'API');
    return mockCharities;
  }

  try {
    const res = await fetch(API_ENDPOINTS.charities);
    if (!res.ok) throw new Error(`Failed to fetch charities: ${res.statusText}`);
    const data = await res.json();
    logger.info(`Successfully fetched ${data.length} charities`, 'API');
    return data;
  } catch (error) {
    logger.error(`Error fetching charities: ${error}`, 'API');
    throw error;
  }
}

/**
 * Processes a donation to a charity.
 */
export async function processDonation(charityId: string, amount: number): Promise<DonationResult> {
  logger.info(`Processing donation: charityId=${charityId}, amount=$${amount}`, 'API');

  if (USE_MOCK) {
    logger.debug('Using mock donation processing', 'API');
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { mockCharities } = await import(MOCK_MODULES.charities);
    const { generateMockInsights } = await import(MOCK_MODULES.donations);

    const charity = mockCharities.find(c => c.id === charityId);
    if (!charity) throw new Error(`Charity not found: ${charityId}`);

    const insights = generateMockInsights(amount, charity);
    return {
      success: true,
      transactionId: `txn_mock_${Date.now()}`,
      charity,
      amount,
      platformFee: amount * 0.05,
      charityAmount: amount * 0.95,
      impact: Math.floor(amount * charity.impactRate),
      insights,
    };
  }

  try {
    const payload = { charityId, amountInCents: amount * 100 };
    const res = await fetch(API_ENDPOINTS.donate, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Donation failed: ${res.statusText}`);
    const data = await res.json();
    logger.info(`Donation successful: ${data.transactionId}`, 'API');
    return data;
  } catch (error) {
    logger.error(`Error processing donation: ${error}`, 'API');
    throw error;
  }
}

/**
 * Fetches the current user's profile.
 */
export async function getUserProfile(): Promise<User> {
  logger.info('Fetching user profile', 'API');

  if (USE_MOCK) {
    const { mockUser } = await import(MOCK_MODULES.user);
    return mockUser;
  }

  try {
    const res = await fetch(API_ENDPOINTS.userProfile);
    if (!res.ok) throw new Error(`Failed to fetch profile: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch (error) {
    logger.error(`Error fetching user profile: ${error}`, 'API');
    throw error;
  }
}

/**
 * Updates the current user's profile.
 */
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  logger.info(`Updating user profile: ${JSON.stringify(updates)}`, 'API');

  if (USE_MOCK) {
    const { mockUser } = await import(MOCK_MODULES.user);
    Object.assign(mockUser, updates);
    return mockUser;
  }

  try {
    const res = await fetch(API_ENDPOINTS.userProfile, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error(`Failed to update profile: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch (error) {
    logger.error(`Error updating user profile: ${error}`, 'API');
    throw error;
  }
}

/**
 * Fetches the user's transaction history.
 */
export async function getTransactions(): Promise<Transaction[]> {
  logger.info('Fetching transaction history', 'API');

  if (USE_MOCK) {
    const { mockTransactions } = await import(MOCK_MODULES.transactions);
    return mockTransactions;
  }

  try {
    const res = await fetch(API_ENDPOINTS.transactions);
    if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch (error) {
    logger.error(`Error fetching transactions: ${error}`, 'API');
    throw error;
  }
}
