// Firebase Authentication helpers
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";

/**
 * Sign in a librarian/admin user with email and password
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign out the current user
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Subscribe to auth state changes
 * @param {function} callback - called with the current user (or null)
 * @returns unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
