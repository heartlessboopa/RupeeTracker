
import type { Expense } from "@/types";

export const initialExpensesData: Expense[] = [
  { id: '1', description: 'Lunch with team', amount: 1200, category: 'Food', date: new Date(2024, 6, 15).toISOString() },
  { id: '2', description: 'Monthly metro pass', amount: 500, category: 'Transport', date: new Date(2024, 6, 1).toISOString() },
  { id: '3', description: 'New headphones', amount: 2500, category: 'Shopping', date: new Date(2024, 6, 10).toISOString() },
  { id: '4', description: 'Electricity Bill', amount: 800, category: 'Utilities', date: new Date(2024, 6, 5).toISOString() },
  { id: '5', description: 'Movie tickets', amount: 600, category: 'Entertainment', date: new Date(2024, 6, 20).toISOString() },
  { id: '6', description: 'Groceries', amount: 3000, category: 'Food', date: new Date(2024, 6, 22).toISOString() },
  { id: '7', description: 'Apartment Rent', amount: 20000, category: 'Rent', date: new Date(2024, 6, 1).toISOString() },
  { id: '8', description: 'Mutual Fund SIP', amount: 5000, category: 'Savings', date: new Date(2024, 6, 5).toISOString() },
];
