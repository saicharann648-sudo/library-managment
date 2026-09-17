// localDB.js — complete localStorage database (no Firebase needed)
// Auto-seeds sample data on first visit so the site is immediately usable.
import { calculateFine } from "../utils/fineCalculator";

// ── Helpers ───────────────────────────────────────────────────────────────────
const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const uid  = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

// ── SETTINGS ──────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  libraryName: "School Library",
  fineRatePerDay: 2,
  defaultLoanDays: 14,
  maxRenewals: 2,
};

export const getSettings = () => {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("lms_settings") || "{}") }; }
  catch { return DEFAULT_SETTINGS; }
};
export const saveSettings = (s) =>
  localStorage.setItem("lms_settings", JSON.stringify({ ...getSettings(), ...s }));

// ── ACTIVITY LOG ──────────────────────────────────────────────────────────────
export const getActivity = () =>
  load("lms_activity").sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

export const logActivity = (type, description, meta = {}) => {
  const entry = { id: uid(), type, description, meta, timestamp: new Date().toISOString() };
  const log   = load("lms_activity");
  save("lms_activity", [entry, ...log].slice(0, 500));
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const loginUser = (email, password) => {
  // Accept both passwords for compatibility
  const validPasswords = ["admin123", "library123"];
  if (email === "admin@library.com" && validPasswords.includes(password)) {
    const user = { email, uid: "admin-uid", role: "librarian" };
    localStorage.setItem("lms_session", JSON.stringify(user));
    return user;
  }
  throw new Error("Invalid credentials.\n\nDemo Login:\nEmail: admin@library.com\nPassword: admin123");
};

export const logoutUser  = () => localStorage.removeItem("lms_session");

export const getSession = () => {
  try { return JSON.parse(localStorage.getItem("lms_session")); }
  catch { return null; }
};

// ── BOOKS ─────────────────────────────────────────────────────────────────────
export const getBooks = () => load("lms_books").sort((a, b) => a.title.localeCompare(b.title));

export const addBook = (data) => {
  const book = {
    ...data,
    id: uid(),
    totalCopies: Number(data.totalCopies),
    availableCopies: Number(data.totalCopies),
    createdAt: new Date().toISOString(),
  };
  save("lms_books", [...load("lms_books"), book]);
  logActivity("ADD_BOOK", `Added book: "${book.title}" by ${book.author}`, { bookId: book.id });
  return book;
};

export const updateBook = (id, data) => {
  const updated = load("lms_books").map((b) =>
    b.id === id ? { ...b, ...data, totalCopies: Number(data.totalCopies ?? b.totalCopies) } : b
  );
  save("lms_books", updated);
  logActivity("EDIT_BOOK", `Updated book: "${data.title || ""}"`, { bookId: id });
};

export const deleteBook = (id) => {
  const book = load("lms_books").find((b) => b.id === id);
  save("lms_books", load("lms_books").filter((b) => b.id !== id));
  logActivity("DELETE_BOOK", `Deleted book: "${book?.title}"`, { bookId: id });
};

export const adjustCopies = (bookId, delta) =>
  save(
    "lms_books",
    load("lms_books").map((b) =>
      b.id === bookId
        ? { ...b, availableCopies: Math.max(0, (b.availableCopies || 0) + delta) }
        : b
    )
  );

// ── MEMBERS ───────────────────────────────────────────────────────────────────
export const getMembers = () => load("lms_members").sort((a, b) => a.name.localeCompare(b.name));

export const addMember = (data) => {
  const member = { ...data, id: uid(), issuedBooks: 0, createdAt: new Date().toISOString() };
  save("lms_members", [...load("lms_members"), member]);
  logActivity("ADD_MEMBER", `Added member: ${member.name} (${member.classSection})`, { memberId: member.id });
  return member;
};

export const updateMember = (id, data) => {
  save("lms_members", load("lms_members").map((m) => (m.id === id ? { ...m, ...data } : m)));
  logActivity("EDIT_MEMBER", `Updated member: ${data.name || ""}`, { memberId: id });
};

export const deleteMember = (id) => {
  const member = load("lms_members").find((m) => m.id === id);
  save("lms_members", load("lms_members").filter((m) => m.id !== id));
  logActivity("DELETE_MEMBER", `Removed member: ${member?.name}`, { memberId: id });
};

export const adjustIssued = (memberId, delta) =>
  save(
    "lms_members",
    load("lms_members").map((m) =>
      m.id === memberId
        ? { ...m, issuedBooks: Math.max(0, (m.issuedBooks || 0) + delta) }
        : m
    )
  );

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────
export const getTransactions = () =>
  load("lms_transactions").sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));

export const issueBook = ({ bookId, memberId, bookTitle, memberName, dueDate }) => {
  const txn = {
    id: uid(),
    bookId,
    memberId,
    bookTitle,
    memberName,
    issuedAt: new Date().toISOString(),
    dueDate,
    returnedAt: null,
    fine: 0,
    finePaid: false,
    renewals: 0,
    status: "issued",
  };
  save("lms_transactions", [...load("lms_transactions"), txn]);
  adjustCopies(bookId, -1);
  adjustIssued(memberId, 1);
  logActivity("ISSUE", `"${bookTitle}" issued to ${memberName}`, { bookId, memberId });
  return txn;
};

export const returnBookTxn = (txnId, { bookId, memberId, dueDate, bookTitle, memberName }) => {
  const fine = calculateFine(dueDate);
  save(
    "lms_transactions",
    load("lms_transactions").map((t) =>
      t.id === txnId
        ? { ...t, returnedAt: new Date().toISOString(), fine, finePaid: fine === 0, status: "returned" }
        : t
    )
  );
  adjustCopies(bookId, 1);
  adjustIssued(memberId, -1);
  logActivity(
    "RETURN",
    `"${bookTitle}" returned by ${memberName}${fine > 0 ? ` — Fine: ₹${fine}` : " — No fine"}`,
    { bookId, memberId, fine }
  );
  return fine;
};

export const renewBookTxn = (txnId, newDueDate) => {
  const txns = load("lms_transactions");
  const txn  = txns.find((t) => t.id === txnId);
  if (!txn) throw new Error("Transaction not found");
  const { maxRenewals } = getSettings();
  if ((txn.renewals || 0) >= maxRenewals)
    throw new Error(`Maximum renewals (${maxRenewals}) reached`);
  const updated = txns.map((t) =>
    t.id === txnId ? { ...t, dueDate: newDueDate, renewals: (t.renewals || 0) + 1 } : t
  );
  save("lms_transactions", updated);
  logActivity(
    "RENEW",
    `"${txn.bookTitle}" renewed for ${txn.memberName} — New due: ${new Date(newDueDate).toLocaleDateString()}`,
    { txnId }
  );
  return (txn.renewals || 0) + 1;
};

export const markFinePaidTxn = (txnId) => {
  const txns = load("lms_transactions");
  const txn  = txns.find((t) => t.id === txnId);
  save("lms_transactions", txns.map((t) => (t.id === txnId ? { ...t, finePaid: true } : t)));
  logActivity("FINE_PAID", `Fine of ₹${txn?.fine} paid — "${txn?.bookTitle}" — ${txn?.memberName}`, {
    txnId,
    fine: txn?.fine,
  });
};

// ── BACKUP / RESTORE ──────────────────────────────────────────────────────────
export const exportBackup = () => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  books:        load("lms_books"),
  members:      load("lms_members"),
  transactions: load("lms_transactions"),
  activity:     load("lms_activity"),
  settings:     getSettings(),
});

export const importBackup = (data) => {
  if (!data.version || !data.books) throw new Error("Invalid backup file");
  save("lms_books",        data.books        || []);
  save("lms_members",      data.members      || []);
  save("lms_transactions", data.transactions || []);
  save("lms_activity",     data.activity     || []);
  if (data.settings) localStorage.setItem("lms_settings", JSON.stringify(data.settings));
  logActivity("RESTORE", `Data restored from backup (${new Date(data.exportedAt).toLocaleDateString()})`);
};

export const resetAllData = () => {
  ["lms_books", "lms_members", "lms_transactions", "lms_activity"].forEach((k) =>
    localStorage.removeItem(k)
  );
};

// ── ONE-TIME WIPE OF OLD AUTO-SEEDED DATA ────────────────────────────────────
// Clears all data that was automatically seeded by previous versions.
// Uses lms_reset_v1 flag so it only runs once per browser.
// Any data the user manually adds after this is safe.
if (typeof localStorage !== "undefined" && !localStorage.getItem("lms_reset_v1")) {
  ["lms_books", "lms_members", "lms_transactions", "lms_activity",
   "lms_demo_cleared", "lms_auto_seeded_v1", "lms_auto_seeded_v2", "lms_auto_seeded_v3"]
    .forEach((k) => localStorage.removeItem(k));
  localStorage.setItem("lms_reset_v1", "true");
}
