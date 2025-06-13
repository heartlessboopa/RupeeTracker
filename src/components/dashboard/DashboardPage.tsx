
"use client";

import * as React from 'react';
import { DollarSign, TrendingDown, PiggyBank, Star, ListChecks, Pencil, Trash2 } from "lucide-react";
import { OverviewCard } from "./OverviewCard";
import { ExpenseEntryForm, type ExpenseFormValues } from "./ExpenseEntryForm";
import { SpendingChart } from "./SpendingChart";
import { BudgetGoalsCard } from "./BudgetGoalsCard";
import type { Expense, BudgetGoal } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { format } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [expenses, setExpenses] = React.useState<Expense[]>(() => 
    [...initialExpensesData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  const [budgetGoals] = React.useState<BudgetGoal[]>(initialBudgetGoalsData);
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
  const [selectedExpenseForDelete, setSelectedExpenseForDelete] = React.useState<Expense | null>(null);

  const handleSaveExpense = (data: ExpenseFormValues, idToUpdate?: string) => {
    if (idToUpdate) {
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === idToUpdate 
          ? { ...exp, ...data, date: data.date.toISOString(), amount: Number(data.amount) } 
          : exp
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      toast({
        title: "Expense Updated",
        description: `${data.description} updated successfully.`,
      });
    } else {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...data,
        amount: Number(data.amount),
        date: data.date.toISOString(),
      };
      setExpenses(prevExpenses => 
        [newExpense, ...prevExpenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      toast({
        title: "Expense Added",
        description: `${data.description} for ₹${data.amount} added successfully.`,
      });
    }
    setExpenseToEdit(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    // Optionally scroll to form
    const formElement = document.getElementById("expense-form-card"); // Assuming card has this id or use a ref
    if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenDeleteDialog = (expense: Expense) => {
    setSelectedExpenseForDelete(expense);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (selectedExpenseForDelete) {
      setExpenses(prev => prev.filter(exp => exp.id !== selectedExpenseForDelete.id));
      toast({
        title: "Expense Deleted",
        description: `${selectedExpenseForDelete.description} deleted.`,
        variant: "destructive"
      });
      setShowDeleteConfirmation(false);
      setSelectedExpenseForDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setExpenseToEdit(null);
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
        <div className="lg:col-span-1" id="expense-form-card">
          <ExpenseEntryForm 
            onSaveExpense={handleSaveExpense} 
            editingExpense={expenseToEdit}
            onCancelEdit={handleCancelEdit}
          />
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0,10).map((expense) => ( 
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{format(new Date(expense.date), "dd MMM, yyyy")}</TableCell>
                    <TableCell className="text-right"><CurrencyDisplay amount={expense.amount} /></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(expense)} title="Delete" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense: 
              <strong className="px-1">{selectedExpenseForDelete?.description}</strong>
              for <CurrencyDisplay amount={selectedExpenseForDelete?.amount ?? 0} />.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirmation(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

