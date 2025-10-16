/**
 * Path: src/config/apiPaths.ts
 * Centralized configuration for API endpoints and mock module loaders.
 * Single source of truth for both production APIs and local mocks.
 */

export const API_ENDPOINTS = {
  charities: '/api/charities',
  donate: '/api/donate',
  userProfile: '/api/user/profile',
  transactions: '/api/transactions',
};

/**
 * Mock module loaders (static import map).
 * These return promises so they can be awaited safely in utils/api.ts.
 */
export const MOCK_MODULES = {
  charities: () => import('@/src/mocks/charities'),
  donations: () => import('@/src/mocks/donations'),
  user: () => import('@/src/mocks/user'),
  transactions: () => import('@/src/mocks/transactions'),
};
