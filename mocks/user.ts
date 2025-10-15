import { User } from '@/utils/types';
export const mockTransactions: Transaction[] = [

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
  {
    id: 'user-2',
    name: 'Vera Wing',
    email: 'vera@vera.com',
    balance: 9250.00,
    hasCompletedOnboarding: false,
    firstDonationDate: null,
    totalDonated: 0,
    lastWWPromptShown: null,
    wwPromptDismissedForPayday: false,
  },
  
];
