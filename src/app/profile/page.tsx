
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useForm as useFormChangePassword } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormContext } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { User, KeyRound, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

const clearDataFormSchema = z.object({
  passwordConfirmClearData: z.string().min(1, "Password is required to clear data."),
});
type ClearDataFormValues = z.infer<typeof clearDataFormSchema>;


export default function ProfilePage() {
  const { user, isLoading: authIsLoading, changePassword, clearAllApplicationData } = useAuth();
  const router = useRouter();
  const { toast } = useToast(); // Local toast for general messages, AuthContext handles specific auth toasts

  const [showClearDataDialog, setShowClearDataDialog] = React.useState(false);

  const changePasswordForm = useFormChangePassword<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const clearDataForm = useForm<ClearDataFormValues>({
    resolver: zodResolver(clearDataFormSchema),
    defaultValues: {
      passwordConfirmClearData: '',
    },
  });


  React.useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/login');
    }
  }, [user, authIsLoading, router]);

  const onSubmitChangePassword = async (data: ChangePasswordFormValues) => {
    const success = await changePassword(data.currentPassword, data.newPassword);
    if (success) {
      // toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' }); // Handled by AuthContext
      changePasswordForm.reset();
    } else {
      // toast({ // Handled by AuthContext
      //   title: 'Password Change Failed',
      //   description: 'Incorrect current password or an error occurred.',
      //   variant: 'destructive',
      // });
      changePasswordForm.resetField('currentPassword');
      changePasswordForm.setValue('newPassword', '');
      changePasswordForm.setValue('confirmNewPassword', '');
    }
  };

  const handleClearAllData = async (data: ClearDataFormValues) => {
    const success = await clearAllApplicationData(data.passwordConfirmClearData);
    if (success) {
      // toast({ title: 'Data Cleared', description: 'All application data has been removed.' }); // Handled by AuthContext
      setShowClearDataDialog(false); 
      clearDataForm.reset();
      // Router push to /login or /register is handled by AuthContext or onAuthStateChanged
    } else {
      // Toast for failure handled by AuthContext
      clearDataForm.resetField('passwordConfirmClearData');
    }
  };


  if (authIsLoading || !user) {
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
  
  const isSubmittingPasswordChange = changePasswordForm.formState.isSubmitting || authIsLoading;
  const isSubmittingClearData = clearDataForm.formState.isSubmitting || authIsLoading;

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
                  value={user.email || ''} 
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
              <Form {...changePasswordForm}>
                <form onSubmit={changePasswordForm.handleSubmit(onSubmitChangePassword)} className="space-y-6">
                  <FormField
                    control={changePasswordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isSubmittingPasswordChange}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={changePasswordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isSubmittingPasswordChange}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={changePasswordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isSubmittingPasswordChange}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSubmittingPasswordChange}>
                     <ShieldCheck className="mr-2 h-4 w-4" />
                    {isSubmittingPasswordChange ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-destructive/80">
                These actions are permanent and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Application Data & Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and all associated expense data from RupeeTrack.
                        Please type your password to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Form {...clearDataForm}>
                      <form onSubmit={clearDataForm.handleSubmit(handleClearAllData)} className="space-y-4">
                        <FormField
                          control={clearDataForm.control}
                          name="passwordConfirmClearData"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="passwordConfirmClearData">Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  id="passwordConfirmClearData" 
                                  type="password" 
                                  placeholder="Enter your password" 
                                  {...field} 
                                  disabled={isSubmittingClearData}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isSubmittingClearData} onClick={() => clearDataForm.reset()}>Cancel</AlertDialogCancel>
                          <Button type="submit" variant="destructive" disabled={isSubmittingClearData}>
                            {isSubmittingClearData ? "Deleting..." : "Yes, delete everything"}
                          </Button>
                        </AlertDialogFooter>
                      </form>
                    </Form>
                  </AlertDialogContent>
                </AlertDialog>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-destructive/70">
                    Proceed with extreme caution. Data recovery will not be possible.
                </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} RupeeTrack. All rights reserved.
      </footer>
    </div>
  );
}
