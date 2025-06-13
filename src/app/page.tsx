
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from "@/components/layout/Header";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { Skeleton } from '@/components/ui/skeleton';


export default function ProtectedHomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // isLoading is true initially, then onAuthStateChanged sets user or null.
    // If loading is finished and there's no user, redirect.
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    // Show a loading state or a blank page while checking auth / redirecting
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8">
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 lg:col-span-1" />
                    <Skeleton className="h-96 lg:col-span-2" />
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} RupeeTrack. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <DashboardPage />
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} RupeeTrack. All rights reserved.
      </footer>
    </div>
  );
}
