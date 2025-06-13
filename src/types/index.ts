
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string for dates
}

// BudgetGoal interface removed

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Education', 'Gifts', 'Rent', 'Savings', 'Other'] as const;
export type Category = typeof CATEGORIES[number];
