// Firestore CRUD helpers for the Books collection
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "books";

/**
 * Get a real-time listener on all books, ordered by title
 * @param {function} callback - receives array of book objects
 * @returns unsubscribe function
 */
export const subscribeToBooks = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy("title"));
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(books);
  });
};

/**
 * Add a new book document to Firestore
 */
export const addBook = async (bookData) => {
  return await addDoc(collection(db, COLLECTION), {
    ...bookData,
    availableCopies: Number(bookData.totalCopies),
    createdAt: serverTimestamp(),
  });
};

/**
 * Update an existing book by ID
 */
export const updateBook = async (id, bookData) => {
  const ref = doc(db, COLLECTION, id);
  return await updateDoc(ref, { ...bookData, updatedAt: serverTimestamp() });
};

/**
 * Delete a book by ID
 */
export const deleteBook = async (id) => {
  return await deleteDoc(doc(db, COLLECTION, id));
};

/**
 * Fetch all books once (used for seeding check)
 */
export const fetchAllBooks = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
