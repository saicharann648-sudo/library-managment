// useBooks — localStorage-based hook (no Firebase)
import { useState, useEffect } from "react";
import { getBooks } from "../db/localDB";
import { notifyAll } from "./useLibrary";

export const useBooks = () => {
  const [books,   setBooks]   = useState(() => getBooks());
  const [loading, setLoading] = useState(false);
  const [error]               = useState(null);

  useEffect(() => {
    // Re-read from localStorage whenever notifyAll() is called
    const refresh = () => setBooks(getBooks());
    // Listen via a simple storage event for cross-tab sync
    const onStorage = (e) => { if (e.key?.startsWith("lms_")) refresh(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { books, loading, error };
};
