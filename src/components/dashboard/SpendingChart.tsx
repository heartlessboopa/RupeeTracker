"use client";

import * as React from "react";
import { PieChart as LucidePieChart } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/types";
import { CATEGORIES } from "@/types";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface SpendingChartProps {
  expenses: Expense[];
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(200, 70%, 50%)",
  "hsl(50, 70%, 50%)",
  "hsl(270, 70%, 50%)",
  "hsl(120, 70%, 50%)",
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
    return Object.entries(aggregated).map(([name, value]) => ({ name, value, fill: chartColors[CATEGORIES.indexOf(name as typeof CATEGORIES[number]) % chartColors.length] }));
  }, [expenses]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    CATEGORIES.forEach((category, index) => {
      config[category] = {
        label: category,
        color: chartColors[index % chartColors.length],
      };
    });
    return config;
  }, []);


  if (!mounted) {
     // Render placeholder or null during SSR to avoid hydration mismatch with ResponsiveContainer
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <LucidePieChart className="h-6 w-6 text-primary" />
            Spending by Category
          </CardTitle>
          <CardDescription>Visual breakdown of your expenses.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <LucidePieChart className="h-6 w-6 text-primary" />
          Spending by Category
        </CardTitle>
        <CardDescription>Visual breakdown of your expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No expense data to display.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={dataByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (percent * 100) > 5 ? ( // Only show label if segment is > 5%
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {dataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
