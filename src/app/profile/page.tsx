
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { User, KeyRound, DownloadCloud, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateExpenseReportPDF } from '@/lib/pdfGenerator';
import { initialExpensesData } from '@/data/initialData'; // Import initial expenses

const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export default function ProfilePage() {
  const { user, isLoading, changePassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const onSubmitChangePassword = (data: ChangePasswordFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You are not logged in.", variant: "destructive" });
      return;
    }
    const success = changePassword(user.email, data.currentPassword, data.newPassword);
    if (success) {
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
      form.reset();
    } else {
      toast({
        title: 'Password Change Failed',
        description: 'Incorrect current password or an error occurred.',
        variant: 'destructive',
      });
      form.resetField('currentPassword');
      form.setValue('newPassword', '');
      form.setValue('confirmNewPassword', '');
    }
  };

  const handleExportAllData = async () => {
    // For this prototype, 'Export All Data' uses the initialExpensesData.
    // In a real app, this would fetch all user-specific data from a backend.
    if (initialExpensesData.length === 0) {
      toast({
        title: "No Data",
        description: "No expenses found in the initial dataset to export.",
      });
      return;
    }
    try {
      await generateExpenseReportPDF(initialExpensesData, "Full Expense History Report", "All recorded expenses (snapshot)");
      toast({
          title: "Report Generated",
          description: `Full Expense History Report has been downloaded.`,
      });
    } catch (error) {
      console.error("Failed to generate PDF for all data:", error);
      toast({
        title: "Error Generating Report",
        description: "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };


  if (isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} RupeeTrack. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Your Profile</h1>
          </div>

          <Card className="shadow-lg border-border">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your primary account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user.email} 
                  readOnly 
                  disabled 
                  className="mt-1 bg-muted/50 cursor-not-allowed" 
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your email address is used for logging in and cannot be changed through this interface.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password for enhanced security.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitChangePassword)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                     <ShieldCheck className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DownloadCloud className="h-5 w-5 text-primary" />
                Data Export
              </CardTitle>
              <CardDescription>Download a copy of your financial data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Export a snapshot of the initial expense dataset as a PDF. For detailed, period-based reports of your current expenses, please use the export feature on the Dashboard.
              </p>
              <Button onClick={handleExportAllData} variant="outline">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export All Data (Snapshot)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} RupeeTrack. All rights reserved.
      </footer>
    </div>
  );
}
