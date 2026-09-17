// Custom hook — real-time Firestore listener for members
import { useEffect, useState } from "react";
import { subscribeToMembers } from "../firebase/members";

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToMembers((data) => {
      setMembers(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { members, loading, error };
};
