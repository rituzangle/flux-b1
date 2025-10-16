/**
 * Path: src/config/apiPaths.ts
 * Centralized configuration for API endpoints and mock module paths.
 * Used by src/utils/api.ts and other services to avoid hardcoded strings.
 */

export const API_ENDPOINTS = {
  charities: '/api/charities',
  donate: '/api/donate',
  userProfile: '/api/user/profile',
  transactions: '/api/transactions',
};

export const MOCK_MODULES = {
  charities: '@/src/mocks/charities',
  donations: '@/src/mocks/donations',
  user: '@/src/mocks/user',
  transactions: '@/src/mocks/transactions',
};
