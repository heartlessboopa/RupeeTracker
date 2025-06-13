
"use client";

import * as React from 'react';
import { IndianRupee, TrendingDown, Star, ListChecks, Pencil, Trash2, ShieldCheck, BarChart3 } from "lucide-react";
import { OverviewCard } from "./OverviewCard";
import { ExpenseEntryForm, type ExpenseFormValues } from "./ExpenseEntryForm";
import { SpendingChart } from "./SpendingChart";
import type { Expense } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
import { initialExpensesData } from '@/data/initialData';

type ActionType = 'edit' | 'delete';
const LOCAL_STORAGE_EXPENSES_KEY = 'rupeeTrackExpenses';

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth(); 
  
  const [expenses, setExpenses] = React.useState<Expense[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedExpenses = localStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY);
        if (storedExpenses) {
          const parsedExpenses: Expense[] = JSON.parse(storedExpenses);
          // Ensure dates are valid and sort
          return parsedExpenses
            .filter(exp => exp.date && !isNaN(new Date(exp.date).getTime())) 
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
      } catch (error) {
        console.error("Failed to load expenses from localStorage", error);
        // Fall through to initial data if localStorage fails
      }
    }
    // Fallback to initial data, sorted
    return [...initialExpensesData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
  
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = React.useState(false);
  const [passwordToConfirm, setPasswordToConfirm] = React.useState('');
  const [currentAction, setCurrentAction] = React.useState<ActionType | null>(null);
  const [selectedExpenseForAction, setSelectedExpenseForAction] = React.useState<Expense | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
    }
  }, [expenses]);


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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <OverviewCard title="Total Spent" value={totalSpent} icon={<TrendingDown className="h-5 w-5" />} description="Total amount spent this period." />
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
          <ExportReportCard expenses={expenses} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <SpendingChart expenses={expenses} />
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
