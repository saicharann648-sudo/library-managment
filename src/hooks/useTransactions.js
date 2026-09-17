// Custom hook — real-time Firestore listener for transactions
import { useEffect, useState } from "react";
import { subscribeToTransactions } from "../firebase/transactions";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToTransactions((data) => {
      setTransactions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { transactions, loading, error };
};
