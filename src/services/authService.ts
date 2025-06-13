
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as firebaseDeleteUser,
  type User as FirebaseUser,
  type AuthError
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { LoginCredentials, RegisterCredentials } from "@/types/auth"; // Will create this
import type { AppUser } from "@/types";


export const authService = {
  onAuthUserChanged: (callback: (user: AppUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
        callback(appUser);
      } else {
        callback(null);
      }
    });
  },

  registerUser: async ({ email, password }: RegisterCredentials): Promise<AppUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      return { uid: firebaseUser.uid, email: firebaseUser.email };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error; // Re-throw to be handled by the caller
    }
  },

  loginUser: async ({ email, password }: LoginCredentials): Promise<AppUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      return { uid: firebaseUser.uid, email: firebaseUser.email };
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error; 
    }
  },

  logoutUser: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out user:", error);
      throw error;
    }
  },

  changeUserPassword: async (currentPasswordAttempt: string, newPasswordVal: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User not authenticated or email not available.");
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPasswordAttempt);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPasswordVal);
    } catch (error) {
      console.error("Error changing password:", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/wrong-password') {
        throw new Error("Incorrect current password.");
      }
      throw new Error("Failed to change password. Please try again.");
    }
  },

  deleteCurrentUserAccount: async (currentPasswordAttempt: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User not authenticated or email not available.");
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPasswordAttempt);
      await reauthenticateWithCredential(user, credential);
      await firebaseDeleteUser(user);
    } catch (error) {
      console.error("Error deleting user account:", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Account not deleted.");
      }
      throw new Error("Failed to delete account. Please try again.");
    }
  }
};
