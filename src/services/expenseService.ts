
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Expense } from "@/types";
import type { ExpenseFormValues } from "@/components/dashboard/ExpenseEntryForm"; // Assuming this type exists

const EXPENSES_COLLECTION = "expenses";

export const expenseService = {
  addExpense: async (userId: string, expenseData: ExpenseFormValues): Promise<Expense> => {
    try {
      const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
        ...expenseData,
        userId,
        amount: Number(expenseData.amount), // Ensure amount is a number
        date: Timestamp.fromDate(new Date(expenseData.date)), // Store as Firestore Timestamp
      });
      return { 
        id: docRef.id, 
        userId, 
        ...expenseData, 
        amount: Number(expenseData.amount),
        date: expenseData.date.toISOString() // Return ISO string for consistency in app
      };
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  },

  getExpenses: async (userId: string): Promise<Expense[]> => {
    try {
      const q = query(
        collection(db, EXPENSES_COLLECTION), 
        where("userId", "==", userId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: (data.date as Timestamp).toDate().toISOString(), // Convert Timestamp to ISO string
        } as Expense;
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  updateExpense: async (expenseId: string, expenseData: Partial<ExpenseFormValues>): Promise<void> => {
    try {
      const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
      const updateData: any = { ...expenseData };
      if (expenseData.amount) {
        updateData.amount = Number(expenseData.amount);
      }
      if (expenseData.date) {
        updateData.date = Timestamp.fromDate(new Date(expenseData.date));
      }
      await updateDoc(expenseRef, updateData);
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  deleteExpense: async (expenseId: string): Promise<void> => {
    try {
      const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  deleteAllUserExpenses: async (userId: string): Promise<void> => {
    try {
      const q = query(collection(db, EXPENSES_COLLECTION), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return; // No expenses to delete
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error deleting all user expenses:", error);
      throw error;
    }
  }
};
