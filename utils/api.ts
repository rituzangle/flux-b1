import { Charity, DonationResult, User, Transaction } from './types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export async function getCharities(): Promise<Charity[]> {
  if (USE_MOCK) {
    const { mockCharities } = await import('@/mocks/charities');
    return mockCharities;
  }
  const res = await fetch('/api/charities');
  if (!res.ok) throw new Error('Failed to fetch charities');
  return res.json();
}

export async function processDonation(
  charityId: string,
  amount: number
): Promise<DonationResult> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { mockCharities } = await import('@/mocks/charities');
    const { generateMockInsights } = await import('@/mocks/donations');

    const charity = mockCharities.find(c => c.id === charityId);
    if (!charity) throw new Error('Charity not found');

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

  const res = await fetch('/api/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ charityId, amountInCents: amount * 100 }),
  });

  if (!res.ok) throw new Error('Donation failed');
  return res.json();
}

export async function getUserProfile(): Promise<User> {
  if (USE_MOCK) {
    const { mockUser } = await import('@/mocks/user');
    return mockUser;
  }
  const res = await fetch('/api/user/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  if (USE_MOCK) {
    const { mockUser } = await import('@/mocks/user');
    Object.assign(mockUser, updates);
    return mockUser;
  }
  const res = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function getTransactions(): Promise<Transaction[]> {
  if (USE_MOCK) {
    const { mockTransactions } = await import('@/mocks/transactions');
    return mockTransactions;
  }
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}
