
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { expenseService } from '@/services/expenseService';
import type { AppUser } from '@/types'; // Using AppUser from central types
import type { LoginCredentials, RegisterCredentials } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  changePassword: (currentPasswordAttempt: string, newPasswordVal: string) => Promise<boolean>;
  clearAllApplicationData: (currentPasswordAttempt: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = authService.onAuthUserChanged((authUser) => {
      setUser(authUser);
      setIsLoading(false);
      if (!authUser && !['/login', '/register'].includes(window.location.pathname)) {
         // router.replace('/login'); // Handled by ProtectedHomePage now
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.loginUser({email: credentials.email, password: credentials.passwordAttempt});
      setUser(loggedInUser); // Set user from authService response
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Login failed in context:", error);
      setIsLoading(false);
      toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" });
      return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logoutUser();
      setUser(null);
      router.push('/login'); // Explicitly redirect after logout
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Failed", description: error.message || "Could not log out.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.registerUser({email: credentials.email, password: credentials.passwordAttempt});
      // Don't auto-login, user will be redirected to login page after successful registration message
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Registration failed in context:", error);
      setIsLoading(false);
      toast({ title: "Registration Failed", description: error.message || "Could not register user.", variant: "destructive" });
      return false;
    }
  }, [toast]);

  const changePassword = useCallback(async (currentPasswordAttempt: string, newPasswordVal: string): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "You are not logged in.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    try {
      await authService.changeUserPassword(currentPasswordAttempt, newPasswordVal);
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Password change failed:", error);
      toast({ title: 'Password Change Failed', description: error.message || "An error occurred.", variant: 'destructive' });
      setIsLoading(false);
      return false;
    }
  }, [user, toast]);
  
  const clearAllApplicationData = useCallback(async (currentPasswordAttempt: string): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to clear data.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    try {
      // Step 1: Delete all expenses for the user from Firestore
      await expenseService.deleteAllUserExpenses(user.uid);
      toast({ title: "Expenses Cleared", description: "Your expense data has been deleted." });

      // Step 2: Delete the user account from Firebase Auth
      // This will also effectively log them out
      await authService.deleteCurrentUserAccount(currentPasswordAttempt);
      toast({ title: "Account Deleted", description: "Your account has been successfully deleted." });
      
      setUser(null); // Clear local user state
      router.push('/register'); // Redirect to register or login after account deletion
      setIsLoading(false);
      return true;

    } catch (error: any) {
      console.error("Failed to clear all application data:", error);
      toast({
        title: "Operation Failed",
        description: error.message || "Could not clear all data. Your account might still exist if only expenses failed to delete.",
        variant: "destructive"
      });
      setIsLoading(false);
      // If account deletion failed due to wrong password, user is still logged in.
      // If expenses were deleted but account deletion failed, user is still logged in.
      // Re-fetch user to ensure state consistency if needed, or rely on onAuthStateChanged.
      // For now, we assume if deleteCurrentUserAccount throws, the user is still effectively logged in (session wise).
      return false;
    }
  }, [user, router, toast]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, changePassword, clearAllApplicationData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
