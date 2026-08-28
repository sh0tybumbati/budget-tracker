export interface CategoryLimit {
  categoryKey: string;
  limitAmount: number;
}

export const DEFAULT_BUDGET_LIMITS: CategoryLimit[] = [
  { categoryKey: 'groceries', limitAmount: 15000 },
  { categoryKey: 'dining', limitAmount: 8000 },
  { categoryKey: 'utilities', limitAmount: 10000 },
  { categoryKey: 'entertainment', limitAmount: 5000 },
  { categoryKey: 'shopping', limitAmount: 7000 },
];

export function calculateCategorySpent(entries: any[], categoryKey: string): number {
  return entries
    .filter((e) => e.type === 'expense' && e.category === categoryKey)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
}
