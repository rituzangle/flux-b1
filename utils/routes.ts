// utils/routes.ts
export const ROUTES = {
  HOME: '/',
  ONBOARDING: '/onboarding',
  DONATE: '/donate',
  AMOUNT: (charityId: string) => `/onboarding/amount?charity=${charityId}`,
};
