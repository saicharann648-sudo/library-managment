// Firestore helpers for Issue/Return Transactions
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import { calculateFine } from "../utils/fineCalculator";

const TRANSACTIONS_COL = "transactions";
const BOOKS_COL = "books";
const MEMBERS_COL = "members";

/**
 * Real-time listener on all transactions, newest first
 */
export const subscribeToTransactions = (callback) => {
  const q = query(collection(db, TRANSACTIONS_COL), orderBy("issuedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(transactions);
  });
};

/**
 * Issue a book to a member
 * - Creates a transaction record
 * - Decrements book's availableCopies
 * - Increments member's issuedBooks count
 */
export const issueBook = async ({ bookId, memberId, bookTitle, memberName, dueDate }) => {
  // Create transaction
  await addDoc(collection(db, TRANSACTIONS_COL), {
    bookId,
    memberId,
    bookTitle,
    memberName,
    issuedAt: serverTimestamp(),
    dueDate,            // ISO string
    returnedAt: null,
    fine: 0,
    status: "issued",   // "issued" | "returned"
  });

  // Decrement available copies
  await updateDoc(doc(db, BOOKS_COL, bookId), {
    availableCopies: increment(-1),
  });

  // Track issued count on member
  await updateDoc(doc(db, MEMBERS_COL, memberId), {
    issuedBooks: increment(1),
  });
};

/**
 * Return a book
 * - Marks transaction as returned and calculates fine
 * - Increments book's availableCopies
 * - Decrements member's issuedBooks count
 */
export const returnBook = async (transactionId, { bookId, memberId, dueDate }) => {
  const returnedAt = new Date();
  const fine = calculateFine(dueDate, returnedAt);

  await updateDoc(doc(db, TRANSACTIONS_COL, transactionId), {
    returnedAt: returnedAt.toISOString(),
    fine,
    status: "returned",
  });

  await updateDoc(doc(db, BOOKS_COL, bookId), {
    availableCopies: increment(1),
  });

  await updateDoc(doc(db, MEMBERS_COL, memberId), {
    issuedBooks: increment(-1),
  });

  return fine;
};

/**
 * Get all currently issued (not returned) transactions
 */
export const fetchIssuedTransactions = async () => {
  const q = query(
    collection(db, TRANSACTIONS_COL),
    where("status", "==", "issued")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
