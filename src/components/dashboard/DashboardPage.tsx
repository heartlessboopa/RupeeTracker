"use client";

import * as React from "react";
import { DollarSign, TrendingDown, PiggyBank, Star, ListChecks } from "lucide-react";
import { OverviewCard } from "./OverviewCard";
import { ExpenseEntryForm } from "./ExpenseEntryForm";
import { SpendingChart } from "./SpendingChart";
import { BudgetGoalsCard } from "./BudgetGoalsCard";
import type { Expense, BudgetGoal } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { format } from "date-fns";

const initialExpensesData: Expense[] = [
  { id: '1', description: 'Lunch with team', amount: 1200, category: 'Food', date: new Date(2024, 6, 15).toISOString() },
  { id: '2', description: 'Monthly metro pass', amount: 500, category: 'Transport', date: new Date(2024, 6, 1).toISOString() },
  { id: '3', description: 'New headphones', amount: 2500, category: 'Shopping', date: new Date(2024, 6, 10).toISOString() },
  { id: '4', description: 'Electricity Bill', amount: 800, category: 'Utilities', date: new Date(2024, 6, 5).toISOString() },
  { id: '5', description: 'Movie tickets', amount: 600, category: 'Entertainment', date: new Date(2024, 6, 20).toISOString() },
  { id: '6', description: 'Groceries', amount: 3000, category: 'Food', date: new Date(2024, 6, 22).toISOString() },
];

const initialBudgetGoalsData: BudgetGoal[] = [
  { category: 'Food', limit: 10000 },
  { category: 'Transport', limit: 2000 },
  { category: 'Shopping', limit: 5000 },
  { category: 'Utilities', limit: 3000 },
  { category: 'Entertainment', limit: 2000 },
  { category: 'Health', limit: 2500 },
  { category: 'Education', limit: 4000 },
  { category: 'Gifts', limit: 1500 },
  { category: 'Other', limit: 1000 },
];


export default function DashboardPage() {
  const [expenses, setExpenses] = React.useState<Expense[]>(initialExpensesData);
  const [budgetGoals] = React.useState<BudgetGoal[]>(initialBudgetGoalsData); // For now, budget goals are static

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
  };

  const totalSpent = React.useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const totalBudget = React.useMemo(() => {
    return budgetGoals.reduce((sum, goal) => sum + goal.limit, 0);
  }, [budgetGoals]);

  const remainingBudget = totalBudget - totalSpent;

  const topSpendingCategory = React.useMemo(() => {
    if (expenses.length === 0) return "N/A";
    const spendingByCat: Record<string, number> = {};
    expenses.forEach(exp => {
      spendingByCat[exp.category] = (spendingByCat[exp.category] || 0) + exp.amount;
    });
    return Object.entries(spendingByCat).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A";
  }, [expenses]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard title="Total Spent" value={totalSpent} icon={<TrendingDown className="h-5 w-5" />} description="Total amount spent this period." />
        <OverviewCard title="Total Budget" value={totalBudget} icon={<PiggyBank className="h-5 w-5" />} description="Your total budget for all categories." />
        <OverviewCard title="Remaining Budget" value={remainingBudget} icon={<DollarSign className="h-5 w-5" />} description={remainingBudget >=0 ? "Amount left to spend." : "You are over budget."} />
        <OverviewCard title="Top Category" value={topSpendingCategory} icon={<Star className="h-5 w-5" />} isCurrency={false} description="Your highest spending category."/>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ExpenseEntryForm onAddExpense={handleAddExpense} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <SpendingChart expenses={expenses} />
          <BudgetGoalsCard budgets={budgetGoals} expenses={expenses} />
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
             <ListChecks className="h-6 w-6 text-primary" />
            Recent Expenses
          </CardTitle>
          <CardDescription>A list of your most recent transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">No expenses recorded yet.</p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0,10).map((expense) => ( // Show recent 10
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{format(new Date(expense.date), "dd MMM, yyyy")}</TableCell>
                    <TableCell className="text-right"><CurrencyDisplay amount={expense.amount} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
