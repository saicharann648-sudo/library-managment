// useMembers — localStorage-based hook (no Firebase)
import { useState, useEffect } from "react";
import { getMembers } from "../db/localDB";

export const useMembers = () => {
  const [members, setMembers] = useState(() => getMembers());
  const [loading, setLoading] = useState(false);
  const [error]               = useState(null);

  useEffect(() => {
    const refresh  = () => setMembers(getMembers());
    const onStorage = (e) => { if (e.key?.startsWith("lms_")) refresh(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { members, loading, error };
};
