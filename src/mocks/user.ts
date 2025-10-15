/**
 * Mock user profile
 * 
 * @file src/mocks/user.ts
 * 
 * Single user object (not array)
 * Used by fetchUser() in utils/api.ts
 */

import type { User } from '@/utils/types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Alex Maigret',
  email: 'alex@example.com',
  balance: 1250.00,
  hasCompletedOnboarding: false, // Toggle to test flows
  firstDonationDate: null,
  totalDonated: 0,
  donationCount: 0,
  lastWWPromptShown: null,
  wwPromptDismissedForPayday: false,
};

// Helper to reset for testing
export function resetMockUser() {
  return {
    ...mockUser,
    hasCompletedOnboarding: false,
  };
}

// Helper to get "completed onboarding" version
export function getMockUserOnboarded() {
  return {
    ...mockUser,
    hasCompletedOnboarding: true,
    totalDonated: 50,
    donationCount: 3,
    firstDonationDate: new Date('2025-01-01'),
  };
}