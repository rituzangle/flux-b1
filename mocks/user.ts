import { User } from '@/utils/types';

export const mockUser: User[] = [
  {
    id: 'user-1',
    name: 'Alex Maigret',
    email: 'alex@example.com',
    balance: 1250.00,
    hasCompletedOnboarding: false,
    firstDonationDate: null,
    totalDonated: 0,
    lastWWPromptShown: null,
    wwPromptDismissedForPayday: false,
  },
  
];
