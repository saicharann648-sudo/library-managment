/**
 * Date helper utilities
 */
import { format, parseISO, isValid } from "date-fns";

/**
 * Format a date/ISO string to DD MMM YYYY
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return isValid(d) ? format(d, "dd MMM yyyy") : "—";
  } catch {
    return "—";
  }
};

/**
 * Format a date to DD MMM YYYY HH:mm
 */
export const formatDateTime = (date) => {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return isValid(d) ? format(d, "dd MMM yyyy, HH:mm") : "—";
  } catch {
    return "—";
  }
};

/**
 * Get ISO string for a date N days from today
 * @param {number} days
 * @returns {string} ISO date string
 */
export const futureDateISO = (days = 14) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD for input[type=date]
};

/**
 * Return today as YYYY-MM-DD
 */
export const todayISO = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Convert Firestore Timestamp or ISO string to JS Date
 */
export const toDate = (val) => {
  if (!val) return null;
  if (val?.toDate) return val.toDate(); // Firestore Timestamp
  if (typeof val === "string") return parseISO(val);
  if (val instanceof Date) return val;
  return null;
};
