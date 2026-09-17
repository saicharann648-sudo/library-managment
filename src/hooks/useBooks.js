// Custom hook — real-time Firestore listener for books
import { useEffect, useState } from "react";
import { subscribeToBooks } from "../firebase/books";

export const useBooks = () => {
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToBooks((data) => {
      setBooks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { books, loading, error };
};
