
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  // In a real app, store a password hash, not the password itself.
  // For prototype simplicity, storing password directly in localStorage.
  // THIS IS NOT SECURE FOR PRODUCTION.
  password?: string; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => boolean;
  logout: () => void;
  register: (email: string, passwordAttempt: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'rupeeTrackUser';
const LOCAL_STORAGE_USERS_LIST_KEY = 'rupeeTrackUsersList'; // For multi-user prototype

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY); // Clear corrupted data
    }
    setIsLoading(false);
  }, []);

  const getUsersList = useCallback((): User[] => {
    try {
      const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_LIST_KEY);
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      console.error("Failed to parse users list from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_USERS_LIST_KEY);
      return [];
    }
  }, []);

  const saveUsersList = useCallback((users: User[]) => {
    localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(users));
  }, []);

  const login = useCallback((email: string, passwordAttempt: string): boolean => {
    const users = getUsersList();
    const foundUser = users.find(u => u.email === email && u.password === passwordAttempt);

    if (foundUser) {
      const currentUser = { email: foundUser.email, password: foundUser.password }; // Store password for re-auth
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
      setUser(currentUser);
      return true;
    }
    return false;
  }, [getUsersList]);

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  const register = useCallback((email: string, passwordAttempt: string): boolean => {
    const users = getUsersList();
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = { email, password: passwordAttempt };
    users.push(newUser);
    saveUsersList(users);
    return true;
  }, [getUsersList, saveUsersList]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
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
