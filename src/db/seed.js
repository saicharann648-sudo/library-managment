// Seed file — optional sample data utilities
import { addDays, subDays } from "date-fns";

const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const clearAllSampleData = () => {
  ["lms_books", "lms_members", "lms_transactions", "lms_activity"].forEach(k => localStorage.removeItem(k));
};

export const seedSampleData = () => {
  clearAllSampleData();
  const now = new Date();

  // ── Books ──────────────────────────────────────────────────────────────
  const BOOKS = [
    { title: "To Kill a Mockingbird",           author: "Harper Lee",          publisher: "J.B. Lippincott",  isbn: "9780061935466", category: "Fiction",     totalCopies: 5, availableCopies: 4 },
    { title: "A Brief History of Time",          author: "Stephen Hawking",     publisher: "Bantam Books",     isbn: "9780553380163", category: "Science",     totalCopies: 4, availableCopies: 4 },
    { title: "The Great Gatsby",                 author: "F. Scott Fitzgerald",  publisher: "Scribner",         isbn: "9780743273565", category: "Fiction",     totalCopies: 6, availableCopies: 5 },
    { title: "Introduction to Algorithms",       author: "Thomas H. Cormen",    publisher: "MIT Press",        isbn: "9780262033848", category: "Programming", totalCopies: 3, availableCopies: 1 },
    { title: "Sapiens",                          author: "Yuval Noah Harari",   publisher: "Harper",           isbn: "9780062316097", category: "History",     totalCopies: 5, availableCopies: 3 },
  ];

  const books = BOOKS.map(b => ({ ...b, id: uid(), createdAt: now.toISOString() }));
  localStorage.setItem("lms_books", JSON.stringify(books));

  // ── Members ────────────────────────────────────────────────────────────
  const MEMBERS_DATA = [
    { name: "Aarav Sharma",  classSection: "10-A", phone: "9876543210", email: "aarav@school.edu",  issuedBooks: 1 },
    { name: "Priya Patel",   classSection: "9-B",  phone: "9876543211", email: "priya@school.edu",  issuedBooks: 0 },
    { name: "Rohan Mehta",   classSection: "11-C", phone: "9876543212", email: "rohan@school.edu",  issuedBooks: 1 },
  ];

  const members = MEMBERS_DATA.map(m => ({ ...m, id: uid(), createdAt: now.toISOString() }));
  localStorage.setItem("lms_members", JSON.stringify(members));

  // ── Transactions ────────────────────────────────────────────────────────
  const transactions = [
    {
      id: uid(), bookId: books[3].id, bookTitle: books[3].title,
      memberId: members[2].id, memberName: members[2].name,
      issuedAt: subDays(now, 20).toISOString(), dueDate: subDays(now, 6).toISOString(),
      returnedAt: null, fine: 0, status: "issued",
    },
    {
      id: uid(), bookId: books[0].id, bookTitle: books[0].title,
      memberId: members[0].id, memberName: members[0].name,
      issuedAt: subDays(now, 5).toISOString(), dueDate: addDays(now, 9).toISOString(),
      returnedAt: null, fine: 0, status: "issued",
    },
  ];
  localStorage.setItem("lms_transactions", JSON.stringify(transactions));
};
