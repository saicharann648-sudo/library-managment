// useTransactions — localStorage-based hook (no Firebase)
import { useState, useEffect } from "react";
import { getTransactions } from "../db/localDB";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState(() => getTransactions());
  const [loading, setLoading]           = useState(false);
  const [error]                         = useState(null);

  useEffect(() => {
    const refresh  = () => setTransactions(getTransactions());
    const onStorage = (e) => { if (e.key?.startsWith("lms_")) refresh(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { transactions, loading, error };
};
