
"use client";

import * as React from "react";
import { BarChart3 } from "lucide-react"; // Changed from PieChart
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense, Category } from "@/types";
import { CATEGORIES } from "@/types";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";

interface SpendingChartProps {
  expenses: Expense[];
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(200, 70%, 50%)", // Additional distinct colors
  "hsl(50, 70%, 50%)",
  "hsl(270, 70%, 50%)",
  "hsl(120, 70%, 50%)",
  "hsl(0, 70%, 50%)", 
  "hsl(180, 70%, 50%)",
];

export function SpendingChart({ expenses }: SpendingChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const dataByCategory = React.useMemo(() => {
    const aggregated: { [key: string]: number } = {};
    for (const expense of expenses) {
      aggregated[expense.category] = (aggregated[expense.category] || 0) + expense.amount;
    }
    // Sort categories alphabetically for consistent bar order, or by value if preferred
    return Object.entries(aggregated)
      .map(([name, value]) => ({ 
        name, 
        amount: value, // Renamed 'value' to 'amount' for clarity with BarChart dataKey
        fill: chartColors[CATEGORIES.indexOf(name as Category) % chartColors.length] 
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Optional: sort for consistent order
  }, [expenses]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    CATEGORIES.forEach((category, index) => {
      config[category] = {
        label: category,
        color: chartColors[index % chartColors.length],
      };
    });
    // Add a specific config for the 'amount' dataKey in the BarChart
    config.amount = {
        label: "Amount",
        // Color here can be a default or might not be used if bars are colored by category directly
    };
    return config;
  }, []);

  if (!mounted) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Spending by Category
          </CardTitle>
          <CardDescription>Visual breakdown of your expenses.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Spending by Category
        </CardTitle>
        <CardDescription>Visual breakdown of your expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">No expense data to display.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataByCategory} margin={{ top: 5, right: 20, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value / 1000}k`} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            Amount: <CurrencyDisplay amount={payload[0].value as number} />
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  wrapperStyle={{ paddingBottom: '10px' }}
                  formatter={(value, entry) => {
                    const { color } = entry;
                    const category = value as Category; // 'amount' bar is colored by its fill property
                    return <span style={{ color }}>{chartConfig[category]?.label || category}</span>;
                  }}
                />
                <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
                  {dataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
