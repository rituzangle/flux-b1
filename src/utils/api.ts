/**
 * Path: src/utils/api.ts
 * API utility functions for fetching data.
 * Handles both mock data and real API calls based on environment configuration.
 */
import { Charity, DonationResult, User, Transaction } from '@/src/utils/types';
import { logger } from '@/src/utils/prettyLogs';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

/**
 * Fetches the list of available charities.
 * @returns Promise<Charity[]> Array of charity objects
 */
export async function getCharities(): Promise<Charity[]> {
  logger.info('Fetching charities list', 'API');

  if (USE_MOCK) {
    logger.debug('Using mock charities data', 'API');
    const { mockCharities } = await import('@/src/mocks/charities');
      logger.debug(`Loaded mockCharities:\n${JSON.stringify(mockCharities, null, 2)}`, 'API');
    return mockCharities;
  }

  try {
    const res = await fetch('/api/charities');
    if (!res.ok) {
      logger.error(`Failed to fetch charities: ${res.status} ${res.statusText}`, 'API');
      throw new Error('Failed to fetch charities');
    }
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
 * @param charityId - The ID of the charity to donate to
 * @param amount - The donation amount in dollars
 * @returns Promise<DonationResult> Result of the donation including transaction details
 */
export async function processDonation(
  charityId: string,
  amount: number
): Promise<DonationResult> {
  logger.info(`Processing donation: charityId=${charityId}, amount=$${amount}`, 'API');

  if (USE_MOCK) {
    logger.debug('Using mock donation processing', 'API');
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { mockCharities } = await import('@/mocks/charities');
    const { generateMockInsights } = await import('@/mocks/donations');

    const charity = mockCharities.find(c => c.id === charityId);
    if (!charity) {
      logger.error(`Charity not found: ${charityId}`, 'API');
      throw new Error('Charity not found');
    }

    const insights = generateMockInsights(amount, charity);
    const result = {
      success: true,
      transactionId: `txn_mock_${Date.now()}`,
      charity,
      amount,
      platformFee: amount * 0.05,
      charityAmount: amount * 0.95,
      impact: Math.floor(amount * charity.impactRate),
      insights,
    };

    logger.info(`Mock donation successful: ${result.transactionId}`, 'API');
    return result;
  }

  try {
    logger.debug(
  `Sending donation payload: ${JSON.stringify({ charityId, amountInCents: amount * 100 })}`,
  'API'
);
    const res = await fetch('/api/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charityId, amountInCents: amount * 100 }),
    });

    if (!res.ok) {
      logger.error(`Donation failed: ${res.status} ${res.statusText}`, 'API');
      throw new Error('Donation failed');
    }

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
 * @returns Promise<User> User profile data
 */
export async function getUserProfile(): Promise<User> {
  logger.info('Fetching user profile', 'API');

  if (USE_MOCK) {
    logger.debug('Using mock user data', 'API');
    const { mockUser } = await import('@/mocks/user');
    return mockUser;
  }

  try {
    const res = await fetch('/api/user/profile');
    if (!res.ok) {
      logger.error(`Failed to fetch profile: ${res.status} ${res.statusText}`, 'API');
      throw new Error('Failed to fetch profile');
    }
    const data = await res.json();
    logger.info('Successfully fetched user profile', 'API');
    return data;
  } catch (error) {
    logger.error(`Error fetching user profile: ${error}`, 'API');
    throw error;
  }
}

/**
 * Updates the current user's profile.
 * @param updates - Partial user object with fields to update
 * @returns Promise<User> Updated user profile
 */
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  logger.info(`Updating user profile: ${JSON.stringify(updates)}`, 'API');

  if (USE_MOCK) {
    logger.debug('Using mock user update', 'API');
    const { mockUser } = await import('@/mocks/user');
    Object.assign(mockUser, updates);
    logger.info('Mock user profile updated', 'API');
    return mockUser;
  }

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      logger.error(`Failed to update profile: ${res.status} ${res.statusText}`, 'API');
      throw new Error('Failed to update profile');
    }

    const data = await res.json();
    logger.info('Successfully updated user profile', 'API');
    return data;
  } catch (error) {
    logger.error(`Error updating user profile: ${error}`, 'API');
    throw error;
  }
}

/**
 * Fetches the user's transaction history.
 * @returns Promise<Transaction[]> Array of transaction objects
 */
export async function getTransactions(): Promise<Transaction[]> {
  logger.info('Fetching transaction history', 'API');

  if (USE_MOCK) {
    logger.debug('Using mock transactions data', 'API');
    const { mockTransactions } = await import('@/mocks/transactions');
    return mockTransactions;
  }

  try {
    const res = await fetch('/api/transactions');
    if (!res.ok) {
      logger.error(`Failed to fetch transactions: ${res.status} ${res.statusText}`, 'API');
      throw new Error('Failed to fetch transactions');
    }
    const data = await res.json();
    logger.info(`Successfully fetched ${data.length} transactions`, 'API');
    return data;
  } catch (error) {
    logger.error(`Error fetching transactions: ${error}`, 'API');
    throw error;
  }
}
