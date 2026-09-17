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

// ── AUTO-SEED ON FIRST VISIT ──────────────────────────────────────────────────
// Runs once when the page first loads. Seeds rich demo data so site is
// immediately usable without the user adding anything.
const AUTO_SEED_KEY = "lms_auto_seeded_v3";

const daysAgo  = (n) => new Date(Date.now() - n * 864e5).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 864e5).toISOString();

if (typeof localStorage !== "undefined" && !localStorage.getItem(AUTO_SEED_KEY)) {
  // Clear any stale data from previous broken versions
  ["lms_books", "lms_members", "lms_transactions", "lms_activity",
   "lms_demo_cleared", "lms_auto_seeded_v1", "lms_auto_seeded_v2"].forEach((k) =>
    localStorage.removeItem(k)
  );

  const BOOKS = [
    { title: "To Kill a Mockingbird",      author: "Harper Lee",           publisher: "J.B. Lippincott",  isbn: "9780061935466", category: "Fiction",      totalCopies: 5, availableCopies: 3 },
    { title: "A Brief History of Time",    author: "Stephen Hawking",      publisher: "Bantam Books",     isbn: "9780553380163", category: "Science",      totalCopies: 4, availableCopies: 4 },
    { title: "The Great Gatsby",           author: "F. Scott Fitzgerald",  publisher: "Scribner",         isbn: "9780743273565", category: "Fiction",      totalCopies: 6, availableCopies: 5 },
    { title: "Introduction to Algorithms", author: "Thomas H. Cormen",     publisher: "MIT Press",        isbn: "9780262033848", category: "Programming",  totalCopies: 3, availableCopies: 1 },
    { title: "Sapiens",                    author: "Yuval Noah Harari",    publisher: "Harper",           isbn: "9780062316097", category: "History",      totalCopies: 5, availableCopies: 3 },
    { title: "Python Crash Course",        author: "Eric Matthes",         publisher: "No Starch Press",  isbn: "9781593279288", category: "Programming",  totalCopies: 4, availableCopies: 2 },
    { title: "The Art of War",             author: "Sun Tzu",              publisher: "Pax Librorum",     isbn: "9781599869773", category: "History",      totalCopies: 7, availableCopies: 7 },
    { title: "Calculus: Early Transcend.", author: "James Stewart",        publisher: "Cengage",          isbn: "9781285741550", category: "Mathematics",  totalCopies: 6, availableCopies: 4 },
    { title: "1984",                       author: "George Orwell",        publisher: "Secker & Warburg", isbn: "9780451524935", category: "Fiction",      totalCopies: 8, availableCopies: 6 },
    { title: "The Feynman Lectures",       author: "Richard P. Feynman",   publisher: "Addison-Wesley",   isbn: "9780465023820", category: "Science",      totalCopies: 3, availableCopies: 2 },
    { title: "Atomic Habits",             author: "James Clear",           publisher: "Avery",            isbn: "9780735211292", category: "Self-Help",    totalCopies: 5, availableCopies: 4 },
    { title: "The Alchemist",             author: "Paulo Coelho",          publisher: "HarperOne",        isbn: "9780062315007", category: "Fiction",      totalCopies: 6, availableCopies: 5 },
  ];

  const MEMBERS = [
    { name: "Aarav Sharma",   classSection: "10-A", phone: "9876543210", email: "aarav@school.edu",   issuedBooks: 1 },
    { name: "Priya Patel",    classSection: "9-B",  phone: "9876543211", email: "priya@school.edu",   issuedBooks: 0 },
    { name: "Rohan Mehta",    classSection: "11-C", phone: "9876543212", email: "rohan@school.edu",   issuedBooks: 2 },
    { name: "Sneha Gupta",    classSection: "8-A",  phone: "9876543213", email: "sneha@school.edu",   issuedBooks: 1 },
    { name: "Arjun Singh",    classSection: "12-B", phone: "9876543214", email: "arjun@school.edu",   issuedBooks: 0 },
    { name: "Kavya Reddy",    classSection: "10-B", phone: "9876543215", email: "kavya@school.edu",   issuedBooks: 1 },
    { name: "Dev Joshi",      classSection: "9-A",  phone: "9876543216", email: "dev@school.edu",     issuedBooks: 0 },
    { name: "Nisha Verma",    classSection: "11-A", phone: "9876543217", email: "nisha@school.edu",   issuedBooks: 1 },
  ];

  const now = new Date().toISOString();
  const books   = BOOKS.map((b) => ({ ...b, id: uid(), createdAt: now }));
  const members = MEMBERS.map((m) => ({ ...m, id: uid(), createdAt: now }));

  const transactions = [
    // Overdue — issued 20 days ago, due 6 days ago
    { id: uid(), bookId: books[3].id, bookTitle: books[3].title, memberId: members[2].id, memberName: members[2].name, issuedAt: daysAgo(20), dueDate: daysAgo(6),  returnedAt: null, fine: 0, finePaid: false, renewals: 0, status: "issued" },
    // Active — issued 5 days ago, due in 9 days
    { id: uid(), bookId: books[0].id, bookTitle: books[0].title, memberId: members[0].id, memberName: members[0].name, issuedAt: daysAgo(5),  dueDate: daysAhead(9), returnedAt: null, fine: 0, finePaid: false, renewals: 0, status: "issued" },
    // Overdue — issued 18 days ago, due 4 days ago
    { id: uid(), bookId: books[5].id, bookTitle: books[5].title, memberId: members[2].id, memberName: members[2].name, issuedAt: daysAgo(18), dueDate: daysAgo(4),  returnedAt: null, fine: 0, finePaid: false, renewals: 0, status: "issued" },
    // Active — issued 3 days ago, due in 11 days
    { id: uid(), bookId: books[7].id, bookTitle: books[7].title, memberId: members[3].id, memberName: members[3].name, issuedAt: daysAgo(3),  dueDate: daysAhead(11),returnedAt: null, fine: 0, finePaid: false, renewals: 0, status: "issued" },
    // Active — issued 1 day ago, due in 13 days
    { id: uid(), bookId: books[10].id, bookTitle: books[10].title, memberId: members[5].id, memberName: members[5].name, issuedAt: daysAgo(1), dueDate: daysAhead(13), returnedAt: null, fine: 0, finePaid: false, renewals: 0, status: "issued" },
    // Overdue — issued 10 days ago, due 2 days ago
    { id: uid(), bookId: books[11].id, bookTitle: books[11].title, memberId: members[7].id, memberName: members[7].name, issuedAt: daysAgo(10), dueDate: daysAgo(2), returnedAt: null, fine: 0, finePaid: false, renewals: 0, status: "issued" },
    // Returned — fine paid
    { id: uid(), bookId: books[1].id, bookTitle: books[1].title, memberId: members[3].id, memberName: members[3].name, issuedAt: daysAgo(30), dueDate: daysAgo(16), returnedAt: daysAgo(10), fine: 12, finePaid: true,  renewals: 0, status: "returned" },
    // Returned — no fine
    { id: uid(), bookId: books[4].id, bookTitle: books[4].title, memberId: members[1].id, memberName: members[1].name, issuedAt: daysAgo(20), dueDate: daysAgo(6),  returnedAt: daysAgo(8), fine: 0,  finePaid: true,  renewals: 1, status: "returned" },
    // Returned — fine unpaid
    { id: uid(), bookId: books[8].id, bookTitle: books[8].title, memberId: members[4].id, memberName: members[4].name, issuedAt: daysAgo(40), dueDate: daysAgo(26), returnedAt: daysAgo(20), fine: 6, finePaid: false, renewals: 0, status: "returned" },
  ];

  const activityLog = [
    { id: uid(), type: "ISSUE",  description: `"${books[3].title}" issued to ${members[2].name}`, meta: {}, timestamp: daysAgo(20) },
    { id: uid(), type: "ISSUE",  description: `"${books[0].title}" issued to ${members[0].name}`, meta: {}, timestamp: daysAgo(5)  },
    { id: uid(), type: "RETURN", description: `"${books[1].title}" returned by ${members[3].name} — Fine: ₹12`, meta: {}, timestamp: daysAgo(10) },
    { id: uid(), type: "RETURN", description: `"${books[4].title}" returned by ${members[1].name} — No fine`, meta: {}, timestamp: daysAgo(8)  },
    { id: uid(), type: "ISSUE",  description: `"${books[5].title}" issued to ${members[2].name}`, meta: {}, timestamp: daysAgo(18) },
    { id: uid(), type: "ISSUE",  description: `"${books[7].title}" issued to ${members[3].name}`, meta: {}, timestamp: daysAgo(3)  },
    { id: uid(), type: "ISSUE",  description: `"${books[10].title}" issued to ${members[5].name}`,meta: {}, timestamp: daysAgo(1)  },
    { id: uid(), type: "ISSUE",  description: `"${books[11].title}" issued to ${members[7].name}`,meta: {}, timestamp: daysAgo(10) },
  ];

  save("lms_books",        books);
  save("lms_members",      members);
  save("lms_transactions", transactions);
  save("lms_activity",     activityLog);
  localStorage.setItem(AUTO_SEED_KEY, "true");
}
