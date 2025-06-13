
"use client";

import * as React from 'react';
import { IndianRupee, TrendingDown, Star, ListChecks, Pencil, Trash2, ShieldCheck } from "lucide-react"; // Removed PiggyBank
import { OverviewCard } from "./OverviewCard";
import { ExpenseEntryForm, type ExpenseFormValues } from "./ExpenseEntryForm";
import { SpendingChart } from "./SpendingChart";
// import { BudgetGoalsCard } from "./BudgetGoalsCard"; // Removed
import type { Expense, Category } from "@/types"; // Removed BudgetGoal
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { ExportReportCard } from "./ExportReportCard";
// import { UserProfileCard } from "./UserProfileCard"; // Removed

const initialExpensesData: Expense[] = [
  { id: '1', description: 'Lunch with team', amount: 1200, category: 'Food', date: new Date(2024, 6, 15).toISOString() },
  { id: '2', description: 'Monthly metro pass', amount: 500, category: 'Transport', date: new Date(2024, 6, 1).toISOString() },
  { id: '3', description: 'New headphones', amount: 2500, category: 'Shopping', date: new Date(2024, 6, 10).toISOString() },
  { id: '4', description: 'Electricity Bill', amount: 800, category: 'Utilities', date: new Date(2024, 6, 5).toISOString() },
  { id: '5', description: 'Movie tickets', amount: 600, category: 'Entertainment', date: new Date(2024, 6, 20).toISOString() },
  { id: '6', description: 'Groceries', amount: 3000, category: 'Food', date: new Date(2024, 6, 22).toISOString() },
  { id: '7', description: 'Apartment Rent', amount: 20000, category: 'Rent', date: new Date(2024, 6, 1).toISOString() },
  { id: '8', description: 'Mutual Fund SIP', amount: 5000, category: 'Savings', date: new Date(2024, 6, 5).toISOString() },
];

// initialBudgetGoalsData removed

type ActionType = 'edit' | 'delete';

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth(); 
  const [expenses, setExpenses] = React.useState<Expense[]>(() => 
    [...initialExpensesData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  // budgetGoals state removed
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
  
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = React.useState(false);
  const [passwordToConfirm, setPasswordToConfirm] = React.useState('');
  const [currentAction, setCurrentAction] = React.useState<ActionType | null>(null);
  const [selectedExpenseForAction, setSelectedExpenseForAction] = React.useState<Expense | null>(null);


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

  const initiateEditExpense = (expense: Expense) => {
    setSelectedExpenseForAction(expense);
    setCurrentAction('edit');
    setShowPasswordConfirmDialog(true);
  };

  const initiateDeleteExpense = (expense: Expense) => {
    setSelectedExpenseForAction(expense);
    setCurrentAction('delete');
    setShowPasswordConfirmDialog(true);
  };

  const handlePasswordConfirm = () => {
    if (!user || !user.password) {
      toast({ title: "Error", description: "User session error.", variant: "destructive" });
      setShowPasswordConfirmDialog(false);
      return;
    }
    if (passwordToConfirm !== user.password) {
      toast({ title: "Incorrect Password", description: "The password you entered is incorrect.", variant: "destructive" });
      setPasswordToConfirm(''); 
      return;
    }

    setShowPasswordConfirmDialog(false);
    setPasswordToConfirm('');
    
    if (currentAction === 'edit' && selectedExpenseForAction) {
      setExpenseToEdit(selectedExpenseForAction);
      const formElement = document.getElementById("expense-form-card"); 
      if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else if (currentAction === 'delete' && selectedExpenseForAction) {
      setExpenses(prev => prev.filter(exp => exp.id !== selectedExpenseForAction!.id));
      toast({
        title: "Expense Deleted",
        description: `${selectedExpenseForAction!.description} deleted.`,
        variant: "destructive"
      });
    }
    
    setSelectedExpenseForAction(null);
    setCurrentAction(null);
  };
  
  const handleCancelPasswordConfirm = () => {
    setShowPasswordConfirmDialog(false);
    setPasswordToConfirm('');
    setSelectedExpenseForAction(null);
    setCurrentAction(null);
  };


  const handleCancelEdit = () => {
    setExpenseToEdit(null);
  };

  const totalSpent = React.useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // totalBudget and remainingBudget removed

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"> {/* Changed to lg:grid-cols-2 from lg:grid-cols-4 */}
        <OverviewCard title="Total Spent" value={totalSpent} icon={<TrendingDown className="h-5 w-5" />} description="Total amount spent this period." />
        {/* Removed Total Budget and Remaining Budget OverviewCards */}
        <OverviewCard title="Top Category" value={topSpendingCategory} icon={<Star className="h-5 w-5" />} isCurrency={false} description="Your highest spending category."/>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <div id="expense-form-card">
            <ExpenseEntryForm 
              onSaveExpense={handleSaveExpense} 
              editingExpense={expenseToEdit}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          {/* UserProfileCard removed */}
          <ExportReportCard expenses={expenses} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <SpendingChart expenses={expenses} />
          {/* BudgetGoalsCard removed */}
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
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0,10).map((expense) => ( 
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell className="hidden md:table-cell">{expense.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(expense.date), "dd MMM, yyyy")}</TableCell>
                    <TableCell className="text-right"><CurrencyDisplay amount={expense.amount} /></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => initiateEditExpense(expense)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => initiateDeleteExpense(expense)} title="Delete" className="text-destructive hover:text-destructive">
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

      <Dialog open={showPasswordConfirmDialog} onOpenChange={(open) => { if(!open) handleCancelPasswordConfirm(); else setShowPasswordConfirmDialog(open);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Confirm Action
            </DialogTitle>
            <DialogDescription>
              To {currentAction} the expense &quot;{selectedExpenseForAction?.description}&quot;, 
              please enter your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Password</Label>
              <Input 
                id="passwordConfirm" 
                type="password" 
                placeholder="Enter your password"
                value={passwordToConfirm}
                onChange={(e) => setPasswordToConfirm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordConfirm(); }}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleCancelPasswordConfirm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handlePasswordConfirm}>
              Confirm {currentAction === 'edit' ? 'Edit' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
