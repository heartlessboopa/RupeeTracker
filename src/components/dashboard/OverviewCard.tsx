"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";

interface OverviewCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isCurrency?: boolean;
  description?: string;
}

export function OverviewCard({ title, value, icon, isCurrency = true, description }: OverviewCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isCurrency && typeof value === 'number' ? <CurrencyDisplay amount={value} /> : value}
        </div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
