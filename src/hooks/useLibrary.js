// useLibrary — single hook that manages all app state using localStorage
// Re-renders components whenever data changes via a version counter
import { useState, useEffect, useCallback } from "react";
import {
  getBooks, addBook, updateBook, deleteBook,
  getMembers, addMember, updateMember, deleteMember,
  getTransactions, issueBook, returnBookTxn,
} from "../db/localDB";

// Global version bump to force re-renders across components
let _version = 0;
const _listeners = new Set();
export const notifyAll = () => { _version++; _listeners.forEach(fn => fn(_version)); };

export const useLibrary = () => {
  const [, setV] = useState(_version);

  useEffect(() => {
    _listeners.add(setV);
    return () => _listeners.delete(setV);
  }, []);

  const refresh = notifyAll;

  // ── Books ──────────────────────────────────────────────────────────────
  const books = getBooks();

  const handleAddBook = useCallback(async (data) => {
    addBook(data);
    refresh();
  }, []);

  const handleUpdateBook = useCallback(async (id, data) => {
    updateBook(id, data);
    refresh();
  }, []);

  const handleDeleteBook = useCallback(async (id) => {
    deleteBook(id);
    refresh();
  }, []);

  // ── Members ────────────────────────────────────────────────────────────
  const members = getMembers();

  const handleAddMember = useCallback(async (data) => {
    addMember(data);
    refresh();
  }, []);

  const handleUpdateMember = useCallback(async (id, data) => {
    updateMember(id, data);
    refresh();
  }, []);

  const handleDeleteMember = useCallback(async (id) => {
    deleteMember(id);
    refresh();
  }, []);

  // ── Transactions ────────────────────────────────────────────────────────
  const transactions = getTransactions();

  const handleIssue = useCallback(async (data) => {
    issueBook(data);
    refresh();
  }, []);

  const handleReturn = useCallback(async (txnId, opts) => {
    const fine = returnBookTxn(txnId, opts);
    refresh();
    return fine;
  }, []);

  return {
    books, handleAddBook, handleUpdateBook, handleDeleteBook,
    members, handleAddMember, handleUpdateMember, handleDeleteMember,
    transactions, handleIssue, handleReturn,
  };
};
