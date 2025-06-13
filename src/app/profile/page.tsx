
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { User, KeyRound, DownloadCloud } from 'lucide-react'; // Changed Download to DownloadCloud for variety

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

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
            <CardContent className="space-y-4">
              {/* 
              This section is a placeholder for future password change functionality.
              It would typically involve a form with fields for current password, 
              new password, and confirm new password, along with a submit button.
              Logic in AuthContext would handle the password update.
              */}
              <p className="text-sm text-muted-foreground italic">
                Password change functionality is planned for a future update. For now, this feature is not implemented.
              </p>
              <Button disabled variant="outline">Update Password</Button>
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
            <CardContent>
              {/* 
              This section is a placeholder for future data export functionality.
              It might include options for different formats (e.g., JSON, CSV) 
              or date ranges.
              */}
              <p className="text-sm text-muted-foreground italic">
                Data export functionality is planned for a future update. For now, this feature is not implemented.
              </p>
              <Button disabled variant="outline">Export All Data</Button>
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
