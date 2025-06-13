"use client";

import * as React from "react";
import { Target, Utensils, Car, ShoppingCart, Home, Tv, HeartPulse, BookOpen, Gift, GripVertical } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import type { BudgetGoal, Expense, Category } from "@/types";

interface BudgetGoalsCardProps {
  budgets: BudgetGoal[];
  expenses: Expense[];
}

const categoryIcons: Record<Category, React.ReactNode> = {
  Food: <Utensils className="h-5 w-5" />,
  Transport: <Car className="h-5 w-5" />,
  Shopping: <ShoppingCart className="h-5 w-5" />,
  Utilities: <Home className="h-5 w-5" />,
  Entertainment: <Tv className="h-5 w-5" />,
  Health: <HeartPulse className="h-5 w-5" />,
  Education: <BookOpen className="h-5 w-5" />,
  Gifts: <Gift className="h-5 w-5" />,
  Other: <GripVertical className="h-5 w-5" />,
};


export function BudgetGoalsCard({ budgets, expenses }: BudgetGoalsCardProps) {
  const getSpentAmount = (category: string) => {
    return expenses
      .filter((exp) => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Budget Goals
        </CardTitle>
        <CardDescription>Track your progress towards your budget limits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgets.length === 0 ? (
          <p className="text-muted-foreground">No budget goals set yet.</p>
        ) : (
          budgets.map((budget) => {
            const spent = getSpentAmount(budget.category);
            const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const remaining = budget.limit - spent;

            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {categoryIcons[budget.category as Category] || <Target className="h-5 w-5" />}
                    <span className="font-medium">{budget.category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <CurrencyDisplay amount={spent} /> / <CurrencyDisplay amount={budget.limit} />
                  </div>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-3" />
                <p className={`text-xs ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {remaining >= 0 ? 
                    <><CurrencyDisplay amount={remaining} /> remaining</> : 
                    <><CurrencyDisplay amount={Math.abs(remaining)} /> over budget</>
                  }
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
