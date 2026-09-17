// firebase/transactions.js — STUB (transactions handled by localDB.js)
import { getTransactions } from "../db/localDB";

export const subscribeToTransactions = (callback) => {
  callback(getTransactions());
  return () => {};
};
export const issueBook = async () => {};
export const returnBook = async () => 0;
export const fetchIssuedTransactions = async () =>
  getTransactions().filter((t) => t.status === "issued");
