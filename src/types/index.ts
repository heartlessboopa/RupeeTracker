
import type { User as FirebaseUser } from 'firebase/auth';

export interface Expense {
  id: string; // Firestore document ID
  userId: string; // Firebase Auth User UID
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string for dates, or Firestore Timestamp
}

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Education', 'Gifts', 'Rent', 'Savings', 'Other'] as const;
export type Category = typeof CATEGORIES[number];

// This is the user type we'll use within our app context
// It can be a subset of FirebaseUser or include additional app-specific fields
export interface AppUser {
  uid: string;
  email: string | null;
  // Add other fields you might need from FirebaseUser or custom fields
  // displayName?: string | null;
  // photoURL?: string | null;
}
