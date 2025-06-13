
"use client";

import * as React from 'react';
import { IndianRupee, TrendingDown, Star, ListChecks, Pencil, Trash2, ShieldCheck, BarChart3, Loader2 } from "lucide-react";
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
import { expenseService } from '@/services/expenseService';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type ActionType = 'edit' | 'delete';

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth(); 
  
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = React.useState(true);
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
  
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = React.useState(false);
  const [passwordToConfirm, setPasswordToConfirm] = React.useState('');
  const [currentAction, setCurrentAction] = React.useState<ActionType | null>(null);
  const [selectedExpenseForAction, setSelectedExpenseForAction] = React.useState<Expense | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = React.useState(false);


  React.useEffect(() => {
    const fetchExpenses = async () => {
      if (user?.uid) {
        setIsLoadingExpenses(true);
        try {
          const fetchedExpenses = await expenseService.getExpenses(user.uid);
          setExpenses(fetchedExpenses);
        } catch (error) {
          console.error("Failed to load expenses:", error);
          toast({ title: "Error", description: "Could not load expenses.", variant: "destructive" });
        } finally {
          setIsLoadingExpenses(false);
        }
      } else {
        setExpenses([]); // Clear expenses if no user
        setIsLoadingExpenses(false);
      }
    };
    fetchExpenses();
  }, [user, toast]);


  const handleSaveExpense = async (data: ExpenseFormValues, idToUpdate?: string) => {
    if (!user?.uid) {
        toast({ title: "Error", description: "You must be logged in to save expenses.", variant: "destructive" });
        return;
    }
    
    setIsLoadingExpenses(true); // Indicate loading state
    try {
        if (idToUpdate) {
        await expenseService.updateExpense(idToUpdate, data);
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
        const newExpense = await expenseService.addExpense(user.uid, data);
        setExpenses(prevExpenses => 
            [newExpense, ...prevExpenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        toast({
            title: "Expense Added",
            description: `${data.description} for ₹${data.amount} added successfully.`,
        });
        }
    } catch (error) {
        console.error("Failed to save expense:", error);
        toast({ title: "Save Failed", description: "Could not save the expense.", variant: "destructive" });
    } finally {
        setIsLoadingExpenses(false);
        setExpenseToEdit(null); 
    }
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

  const handlePasswordConfirm = async () => {
    // Password confirmation for edit/delete is removed as Firebase re-auth is per-action if needed
    // For simplicity with Firestore, we'll proceed directly if user is authenticated.
    // Sensitive operations on backend should enforce re-authentication if necessary.

    if (!user || !selectedExpenseForAction) {
      toast({ title: "Error", description: "User session error or no expense selected.", variant: "destructive" });
      setShowPasswordConfirmDialog(false);
      return;
    }

    setIsSubmittingAction(true);
    setShowPasswordConfirmDialog(false); // Close dialog immediately
    
    try {
        if (currentAction === 'edit' && selectedExpenseForAction) {
        setExpenseToEdit(selectedExpenseForAction);
        const formElement = document.getElementById("expense-form-card-container"); 
        if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        } else if (currentAction === 'delete' && selectedExpenseForAction) {
        await expenseService.deleteExpense(selectedExpenseForAction.id);
        setExpenses(prev => prev.filter(exp => exp.id !== selectedExpenseForAction!.id));
        toast({
            title: "Expense Deleted",
            description: `${selectedExpenseForAction!.description} deleted.`,
            variant: "destructive"
        });
        }
    } catch (error) {
        console.error(`Failed to ${currentAction} expense:`, error);
        toast({ title: `${currentAction === 'edit' ? 'Edit' : 'Delete'} Failed`, description: `Could not ${currentAction} the expense.`, variant: "destructive" });
    } finally {
        setIsSubmittingAction(false);
        setPasswordToConfirm(''); // Clear password field
        setSelectedExpenseForAction(null);
        setCurrentAction(null);
    }
  };
  
  const handleCancelPasswordConfirm = () => {
    setShowPasswordConfirmDialog(false);
    setPasswordToConfirm('');
    setSelectedExpenseForAction(null);
    setCurrentAction(null);
    setIsSubmittingAction(false);
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

  if (isLoadingExpenses && !user) { // Only show full page skeleton if user is also loading
    return (
        <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 items-start">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
                <Skeleton className="h-[450px] lg:col-span-1" />
                <Skeleton className="h-[450px] lg:col-span-2" />
            </div>
             <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
                <Skeleton className="h-[300px] lg:col-span-1" />
                <Skeleton className="h-[400px] lg:col-span-2" />
            </div>
        </div>
    );
  }


  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 items-start">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <OverviewCard title="Total Spent" value={totalSpent} icon={<TrendingDown className="h-5 w-5" />} description="Total amount spent this period." />
        <OverviewCard title="Top Category" value={topSpendingCategory} icon={<Star className="h-5 w-5" />} isCurrency={false} description="Your highest spending category."/>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="lg:col-span-1" id="expense-form-card-container">
          <ExpenseEntryForm 
            onSaveExpense={handleSaveExpense} 
            editingExpense={expenseToEdit}
            onCancelEdit={handleCancelEdit}
            className="h-full"
            isSubmitting={isLoadingExpenses} // Pass loading state to disable form
          />
        </div>
        <div className="lg:col-span-2">
          <SpendingChart expenses={expenses} className="h-full" isLoading={isLoadingExpenses} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="lg:col-span-1">
          <ExportReportCard expenses={expenses} className="h-full" isLoading={isLoadingExpenses}/>
        </div>
        <div className="lg:col-span-2">
            <Card className="shadow-lg h-full">
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-primary" />
                    Recent Expenses
                </CardTitle>
                <CardDescription>A list of your most recent transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                <ScrollArea className="h-[300px]">
                    {isLoadingExpenses ? (
                        <div className="flex justify-center items-center h-full">
                           <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : expenses.length === 0 ? (
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
                                <Button variant="ghost" size="icon" onClick={() => initiateEditExpense(expense)} title="Edit" disabled={isSubmittingAction}>
                                <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => initiateDeleteExpense(expense)} title="Delete" className="text-destructive hover:text-destructive" disabled={isSubmittingAction}>
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
        </div>
      </div>

      <Dialog open={showPasswordConfirmDialog} onOpenChange={(open) => { if(!open) handleCancelPasswordConfirm(); else setShowPasswordConfirmDialog(open);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Confirm Action: {currentAction === 'edit' ? 'Edit' : 'Delete'} Expense
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {currentAction} the expense &quot;{selectedExpenseForAction?.description}&quot;?
              {/* Password confirmation removed for simpler Firestore integration for now. 
                  Re-authentication should be handled server-side or via Firebase rules for sensitive ops. */}
            </DialogDescription>
          </DialogHeader>
          {/*
          Password field removed for now. 
          If re-auth is needed for these actions with Firebase, it's a more involved flow.
          For this iteration, we assume authenticated user can perform these.
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Password</Label>
              <Input 
                id="passwordConfirm" 
                type="password" 
                placeholder="Enter your password"
                value={passwordToConfirm}
                onChange={(e) => setPasswordToConfirm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isSubmittingAction) handlePasswordConfirm(); }}
                disabled={isSubmittingAction}
              />
            </div>
          </div>
          */}
          <DialogFooter className="sm:justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancelPasswordConfirm} disabled={isSubmittingAction}>
                Cancel
            </Button>
            <Button type="button" onClick={handlePasswordConfirm} disabled={isSubmittingAction}>
              {isSubmittingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm {currentAction === 'edit' ? 'Edit' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
