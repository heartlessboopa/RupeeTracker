
"use client";

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Pencil, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Expense, Category } from "@/types";
import { CATEGORIES } from "@/types";

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.enum(CATEGORIES),
  date: z.date({ required_error: "Date is required" }),
});

export type ExpenseFormValues = z.infer<typeof formSchema>;

interface ExpenseEntryFormProps {
  onSaveExpense: (data: ExpenseFormValues, idToUpdate?: string) => void;
  editingExpense: Expense | null;
  onCancelEdit: () => void;
  className?: string;
}

export function ExpenseEntryForm({ onSaveExpense, editingExpense, onCancelEdit, className }: ExpenseEntryFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      category: CATEGORIES[0],
      date: new Date(),
    },
  });

  const isEditing = !!editingExpense;

  React.useEffect(() => {
    if (editingExpense) {
      form.reset({
        description: editingExpense.description,
        amount: editingExpense.amount,
        category: editingExpense.category as Category,
        date: new Date(editingExpense.date),
      });
    } else {
      form.reset({
        description: "",
        amount: undefined,
        category: CATEGORIES[0],
        date: new Date(),
      });
    }
  }, [editingExpense, form]);

  function onSubmit(values: ExpenseFormValues) {
    const isNewExpense = !editingExpense; 
    
    onSaveExpense(values, editingExpense ? editingExpense.id : undefined);

    if (isNewExpense) {
      form.reset({
        description: "",
        amount: undefined, 
        category: CATEGORIES[0], 
        date: new Date(), 
      });
    }
  }

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          {isEditing ? <Pencil className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
          {isEditing ? "Edit Expense" : "Add New Expense"}
        </CardTitle>
        <CardDescription>
          {isEditing ? "Update the details of your expense." : "Track your spending by adding new expenses here."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lunch, Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {isEditing ? "Update Expense" : "Add Expense"}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={onCancelEdit} className="w-full">
                Cancel Edit
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
