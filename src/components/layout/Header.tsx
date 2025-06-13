
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, LogOut, UserCircle, LogInIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // router.push('/login'); // logout() in AuthContext already handles this
  };

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
            <Activity className="h-7 w-7" />
            <h1 className="text-2xl font-headline font-bold">RupeeTrack</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        {/* Placeholder for user image if available */}
                        {/* <AvatarImage src="/avatars/01.png" alt={user.email} /> */}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Logged in as</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Add more items like "Profile", "Settings" if needed */}
                    {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="space-x-2">
                   <Button variant="outline" onClick={() => router.push('/login')}>
                     <LogInIcon className="mr-2 h-4 w-4" /> Log In
                   </Button>
                   <Button onClick={() => router.push('/register')}>
                     <UserCircle className="mr-2 h-4 w-4" /> Register
                   </Button>
                </div>
              )
            )}
            {isLoading && <div className="h-10 w-24 animate-pulse bg-muted rounded-md"></div>}
          </div>
        </div>
      </div>
    </header>
  );
}
