
"use client";

import * as React from "react";
import { BarChart3 } from "lucide-react"; 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense, Category } from "@/types";
import { CATEGORIES } from "@/types";
import { ChartConfig, ChartContainer } from "@/components/ui/chart"; // Removed ChartTooltipContent as Tooltip is customized directly
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
  "hsl(200, 70%, 50%)", 
  "hsl(50, 70%, 50%)",
  "hsl(270, 70%, 50%)",
  "hsl(120, 70%, 50%)",
  "hsl(0, 70%, 50%)", 
  "hsl(180, 70%, 50%)",
];

const CustomizedXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const MAX_TICK_WIDTH = 65; // Max width for a tick label in pixels before truncating
  const TEXT_OFFSET_Y = 5;   // Offset below the axis line for the text to start

  if (!payload || typeof payload.value === 'undefined') {
    return null;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-(MAX_TICK_WIDTH / 2)} y={TEXT_OFFSET_Y} width={MAX_TICK_WIDTH} height={22}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: `${MAX_TICK_WIDTH}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            fontSize: '12px',
            lineHeight: '1.2',
            color: 'hsl(var(--muted-foreground))',
          }}
          title={payload.value} // Show full category name on hover
        >
          {payload.value}
        </div>
      </foreignObject>
    </g>
  );
};

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
    return Object.entries(aggregated)
      .map(([name, value]) => ({ 
        name, 
        amount: value,
        fill: chartColors[CATEGORIES.indexOf(name as Category) % chartColors.length] 
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [expenses]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    CATEGORIES.forEach((category, index) => {
      config[category] = {
        label: category,
        color: chartColors[index % chartColors.length],
      };
    });
    config.amount = {
        label: "Amount",
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
              <BarChart 
                data={dataByCategory} 
                margin={{ top: 5, right: 20, left: 10, bottom: 25 }} // Adjusted bottom margin
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  height={40} // Adjusted height for non-rotated labels
                  interval={0}
                  tick={<CustomizedXAxisTick />}
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
                    const category = value as Category; 
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
