export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon?: string;
  targetDate?: string;
  createdAt: string;
}

export interface SavingsDeposit {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note?: string;
  period?: string;
}

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'emergency-fund',
    name: '🛡️ Emergency Fund',
    targetAmount: 100000,
    currentAmount: 25000,
    color: 'bg-emerald-500',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'general-savings',
    name: '🐖 General Savings',
    targetAmount: 50000,
    currentAmount: 15000,
    color: 'bg-blue-500',
    createdAt: new Date().toISOString(),
  },
];

export function calculateTotalSavings(goals: SavingsGoal[]): number {
  if (!goals || !Array.isArray(goals)) return 0;
  return goals.reduce((sum, g) => sum + (parseFloat(g.currentAmount as any) || 0), 0);
}
