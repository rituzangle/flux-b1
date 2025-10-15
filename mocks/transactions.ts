import { Transaction } from '@/utils/types';

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'send',
    amount: 50.00,
    date: new Date('2025-10-16'),
    description: 'Lunch split',
    status: 'completed',
    recipient: 'Jordan Lee',
  },
  {
    id: 'txn-2',
    type: 'receive',
    amount: 25.00,
    date: new Date('2025-10-13'),
    description: 'Concert tickets',
    status: 'completed',
    recipient: 'Sam Chen',
  },
  {
    id: 'txn-3',
    type: 'donation',
    amount: 10.00,
    date: new Date('2025-10-05'),
    description: 'World Food Program USA',
    status: 'completed',
  },
];
