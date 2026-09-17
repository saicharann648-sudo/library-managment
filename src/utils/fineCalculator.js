/**
 * Fine Calculator Utility
 * Calculates overdue fine at ₹2 per day past the due date
 */

/**
 * Calculate fine for a returned book
 * @param {string|Date} dueDate - The due date
 * @param {string|Date} returnDate - The actual return date (defaults to today)
 * @returns {number} fine amount in rupees (0 if not overdue)
 */
export const calculateFine = (dueDate, returnDate = new Date()) => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  // Normalize to midnight for accurate day calculation
  due.setHours(0, 0, 0, 0);
  returned.setHours(0, 0, 0, 0);

  const diffMs = returned - due;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 0;

  return diffDays * 2; // ₹2 per day
};

/**
 * Check if a transaction is overdue
 * @param {string|Date} dueDate
 * @returns {boolean}
 */
export const isOverdue = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return today > due;
};

/**
 * Get overdue days count
 * @param {string|Date} dueDate
 * @returns {number} number of overdue days (0 if not overdue)
 */
export const getOverdueDays = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffMs = today - due;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};
