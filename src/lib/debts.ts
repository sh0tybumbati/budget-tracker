export interface DebtItem {
  id: string;
  name: string;
  totalBalance: number;
  remainingBalance: number;
  minimumPayment: number;
  interestRate: number; // e.g. 3.5%
  color: string;
}

export const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'debt-1',
    name: '💳 Credit Card Balance',
    totalBalance: 50000,
    remainingBalance: 32000,
    minimumPayment: 3000,
    interestRate: 3.5,
    color: 'bg-red-500',
  },
  {
    id: 'debt-2',
    name: '🚗 Car Loan',
    totalBalance: 350000,
    remainingBalance: 180000,
    minimumPayment: 12000,
    interestRate: 6.2,
    color: 'bg-amber-500',
  },
];
