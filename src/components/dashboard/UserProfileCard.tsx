
"use client";

import * as React from 'react';
import { UserCircle, ListChecks, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import type { Expense, BudgetGoal } from '@/types';

interface UserProfileCardProps {
  expensesCount: number;
  budgetGoalsCount: number;
}

export function UserProfileCard({ expensesCount, budgetGoalsCount }: UserProfileCardProps) {
  const { user } = useAuth();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" />
          User Profile
        </CardTitle>
        <CardDescription>Your account summary and activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
          <p className="text-lg font-semibold">{user?.email || 'N/A'}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Expenses Tracked:</span>
            </div>
            <span className="text-sm font-semibold">{expensesCount}</span>
        </div>

        <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Active Budget Goals:</span>
            </div>
            <span className="text-sm font-semibold">{budgetGoalsCount}</span>
        </div>

        {/* Placeholder for more profile data in the future */}
        {/* <div>
          <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
          <p className="text-lg font-semibold">January 1, 2024</p> 
        </div> */}
      </CardContent>
    </Card>
  );
}
