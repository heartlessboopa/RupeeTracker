
"use client";

import * as React from "react";
import { Download, CalendarIcon, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import type { Expense } from "@/types";
import { generateExpenseReportPDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const reportTypes = ["current_week", "current_month", "last_month", "current_year", "custom"] as const;
type ReportType = typeof reportTypes[number];

const reportTypeLabels: Record<ReportType, string> = {
  current_week: "Current Week",
  current_month: "Current Month",
  last_month: "Last Month",
  current_year: "Current Year",
  custom: "Custom Date Range",
};

const formSchema = z.object({
  reportType: z.enum(reportTypes),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(data => {
  if (data.reportType === "custom") {
    return !!data.startDate && !!data.endDate;
  }
  return true;
}, {
  message: "Start and end dates are required for custom range.",
  path: ["startDate"], 
}).refine(data => {
    if (data.reportType === "custom" && data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
    }
    return true;
}, {
    message: "End date must be on or after start date.",
    path: ["endDate"],
});


type ExportFormValues = z.infer<typeof formSchema>;

interface ExportReportCardProps {
  expenses: Expense[];
  className?: string;
  isLoading?: boolean;
}

export function ExportReportCard({ expenses, className, isLoading }: ExportReportCardProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ExportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: "current_month",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const selectedReportType = watch("reportType");

  const onSubmit = async (data: ExportFormValues) => {
    setIsGenerating(true);
    let filteredExpenses = [...expenses]; 
    let reportTitle = "Expense Report";
    let filterDescription = "";
    const now = new Date();

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (data.reportType) {
      case "current_week":
        startDate = startOfWeek(now, { weekStartsOn: 1 }); 
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        filterDescription = `For Current Week (${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")})`;
        reportTitle = "Weekly Expense Report";
        break;
      case "current_month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        filterDescription = `For Current Month (${format(startDate, "MMMM yyyy")})`;
        reportTitle = "Monthly Expense Report";
        break;
      case "last_month":
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        startDate = lastMonthStart;
        endDate = endOfMonth(lastMonthStart);
        filterDescription = `For Last Month (${format(startDate, "MMMM yyyy")})`;
        reportTitle = "Last Month's Expense Report";
        break;
      case "current_year":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        filterDescription = `For Current Year (${format(startDate, "yyyy")})`;
        reportTitle = "Yearly Expense Report";
        break;
      case "custom":
        if (data.startDate && data.endDate) {
          startDate = data.startDate;
          endDate = new Date(data.endDate.getFullYear(), data.endDate.getMonth(), data.endDate.getDate(), 23, 59, 59, 999); 
          filterDescription = `From ${format(startDate, "dd/MM/yyyy")} to ${format(endDate, "dd/MM/yyyy")}`;
          reportTitle = "Custom Range Expense Report";
        } else {
          toast({ title: "Error", description: "Custom date range requires start and end dates.", variant: "destructive" });
          setIsGenerating(false);
          return;
        }
        break;
    }

    if (startDate && endDate) {
      const finalStartDate = startDate; 
      const finalEndDate = endDate;
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= finalStartDate && expenseDate <= finalEndDate;
      });
    }
    
    filteredExpenses.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    if (filteredExpenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expenses found for the selected period.",
      });
      setIsGenerating(false);
      return;
    }

    try {
      await generateExpenseReportPDF(filteredExpenses, reportTitle, filterDescription);
      toast({
          title: "Report Generated",
          description: `${reportTitle} has been downloaded.`,
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "Error Generating Report",
        description: "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const formDisabled = isGenerating || isLoading;

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Download className="h-6 w-6 text-primary" />
          Export Report
        </CardTitle>
        <CardDescription>Download your expenses as a PDF document.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-full py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="reportType"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="reportType" className="mb-1 block">Report Period</Label>
                <Select onValueChange={field.onChange} value={field.value} disabled={formDisabled}>
                    <SelectTrigger id="reportType">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        {reportTypes.map(type => (
                        <SelectItem key={type} value={type}>
                            {reportTypeLabels[type]}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            )}
          />

          {selectedReportType === "custom" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <Label htmlFor="startDate" className="mb-1">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                          <Button
                            id="startDate"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              errors.startDate && "border-destructive"
                            )}
                            disabled={formDisabled}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pick a date</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("2000-01-01") || formDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
                  </div>
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col">
                     <Label htmlFor="endDate" className="mb-1">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                          <Button
                            id="endDate"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              errors.endDate && "border-destructive"
                            )}
                            disabled={formDisabled}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pick a date</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("2000-01-01") || formDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                     {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>}
                  </div>
                )}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={formDisabled}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate & Download PDF"}
          </Button>
        </form>
        )}
      </CardContent>
    </Card>
  );
}
