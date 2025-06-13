
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { expenseService } from '@/services/expenseService';
import type { AppUser } from '@/types';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import type { AuthError } from 'firebase/auth';

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

const getFirebaseAuthErrorMessage = (error: any): string => {
  const firebaseError = error as AuthError;
  if (firebaseError && firebaseError.code) {
    switch (firebaseError.code) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
        return 'No user found with this email. Please check the email or register.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email address is already in use by another account.';
      case 'auth/weak-password':
        return 'The password is too weak. Please choose a stronger password (at least 6 characters).';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled for this app. Please contact support.';
      case 'auth/invalid-credential':
         return 'Invalid credentials. Please check your email and password.';
      default:
        return firebaseError.message || 'An unexpected authentication error occurred.';
    }
  }
  return error.message || 'An unexpected error occurred during authentication.';
};


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
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.loginUser({email: credentials.email, password: credentials.passwordAttempt});
      setUser(loggedInUser);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Login failed in context:", error);
      setIsLoading(false);
      toast({ title: "Login Failed", description: getFirebaseAuthErrorMessage(error), variant: "destructive" });
      return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logoutUser();
      setUser(null);
      router.push('/login'); 
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Failed", description: getFirebaseAuthErrorMessage(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.registerUser({email: credentials.email, password: credentials.passwordAttempt});
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Registration failed in context:", error);
      setIsLoading(false);
      toast({ title: "Registration Failed", description: getFirebaseAuthErrorMessage(error), variant: "destructive" });
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
      toast({ title: 'Password Change Failed', description: getFirebaseAuthErrorMessage(error), variant: 'destructive' });
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
      await expenseService.deleteAllUserExpenses(user.uid);
      // Toast for expense deletion handled within expenseService or could be added here
      // toast({ title: "Expenses Cleared", description: "Your expense data has been deleted." });

      await authService.deleteCurrentUserAccount(currentPasswordAttempt);
      toast({ title: "Account Deleted", description: "Your account and associated data have been successfully deleted." });
      
      setUser(null); 
      router.push('/register'); 
      setIsLoading(false);
      return true;

    } catch (error: any) {
      console.error("Failed to clear all application data:", error);
      toast({
        title: "Operation Failed",
        description: getFirebaseAuthErrorMessage(error),
        variant: "destructive"
      });
      setIsLoading(false);
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

