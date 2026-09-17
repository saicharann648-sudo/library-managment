// Seed script — populates Firestore with sample books, members, and transactions
// Runs automatically on first login if the DB is empty
import { addDoc, collection, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "./config";
import { addDays, subDays, formatISO } from "date-fns";

const SAMPLE_BOOKS = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    publisher: "J.B. Lippincott & Co.",
    isbn: "9780061935466",
    category: "Fiction",
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    publisher: "Bantam Books",
    isbn: "9780553380163",
    category: "Science",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    publisher: "Scribner",
    isbn: "9780743273565",
    category: "Fiction",
    totalCopies: 6,
    availableCopies: 5,
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    publisher: "MIT Press",
    isbn: "9780262033848",
    category: "Programming",
    totalCopies: 3,
    availableCopies: 1,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    publisher: "Harper",
    isbn: "9780062316097",
    category: "History",
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    title: "Python Crash Course",
    author: "Eric Matthes",
    publisher: "No Starch Press",
    isbn: "9781593279288",
    category: "Programming",
    totalCopies: 4,
    availableCopies: 2,
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    publisher: "Pax Librorum",
    isbn: "9781599869773",
    category: "History",
    totalCopies: 7,
    availableCopies: 7,
  },
  {
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    publisher: "Cengage Learning",
    isbn: "9781285741550",
    category: "Mathematics",
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    title: "1984",
    author: "George Orwell",
    publisher: "Secker & Warburg",
    isbn: "9780451524935",
    category: "Fiction",
    totalCopies: 8,
    availableCopies: 6,
  },
  {
    title: "The Feynman Lectures on Physics",
    author: "Richard P. Feynman",
    publisher: "Addison-Wesley",
    isbn: "9780465023820",
    category: "Science",
    totalCopies: 3,
    availableCopies: 2,
  },
];

const SAMPLE_MEMBERS = [
  {
    name: "Aarav Sharma",
    classSection: "10-A",
    phone: "9876543210",
    email: "aarav.sharma@school.edu",
    issuedBooks: 1,
  },
  {
    name: "Priya Patel",
    classSection: "9-B",
    phone: "9876543211",
    email: "priya.patel@school.edu",
    issuedBooks: 0,
  },
  {
    name: "Rohan Mehta",
    classSection: "11-C",
    phone: "9876543212",
    email: "rohan.mehta@school.edu",
    issuedBooks: 2,
  },
  {
    name: "Sneha Gupta",
    classSection: "8-A",
    phone: "9876543213",
    email: "sneha.gupta@school.edu",
    issuedBooks: 1,
  },
  {
    name: "Arjun Singh",
    classSection: "12-B",
    phone: "9876543214",
    email: "arjun.singh@school.edu",
    issuedBooks: 0,
  },
];

/**
 * Checks if the DB is already seeded (has any books).
 * If not, seeds books, members, and some demo transactions.
 */
export const seedDatabase = async () => {
  try {
    const booksSnap = await getDocs(collection(db, "books"));
    if (!booksSnap.empty) return; // Already seeded

    console.log("Seeding database with sample data...");

    // Seed books
    const bookRefs = [];
    for (const book of SAMPLE_BOOKS) {
      const ref = await addDoc(collection(db, "books"), {
        ...book,
        createdAt: serverTimestamp(),
      });
      bookRefs.push({ id: ref.id, ...book });
    }

    // Seed members
    const memberRefs = [];
    for (const member of SAMPLE_MEMBERS) {
      const ref = await addDoc(collection(db, "members"), {
        ...member,
        createdAt: serverTimestamp(),
      });
      memberRefs.push({ id: ref.id, ...member });
    }

    // Seed demo transactions:
    // 1. Overdue book (issued 20 days ago, due 6 days ago)
    await addDoc(collection(db, "transactions"), {
      bookId: bookRefs[3].id,
      memberId: memberRefs[2].id,
      bookTitle: bookRefs[3].title,
      memberName: memberRefs[2].name,
      issuedAt: subDays(new Date(), 20).toISOString(),
      dueDate: subDays(new Date(), 6).toISOString(),
      returnedAt: null,
      fine: 0,
      status: "issued",
    });

    // 2. Active (non-overdue) issued book
    await addDoc(collection(db, "transactions"), {
      bookId: bookRefs[0].id,
      memberId: memberRefs[0].id,
      bookTitle: bookRefs[0].title,
      memberName: memberRefs[0].name,
      issuedAt: subDays(new Date(), 5).toISOString(),
      dueDate: addDays(new Date(), 9).toISOString(),
      returnedAt: null,
      fine: 0,
      status: "issued",
    });

    // 3. Returned book with fine paid
    await addDoc(collection(db, "transactions"), {
      bookId: bookRefs[1].id,
      memberId: memberRefs[3].id,
      bookTitle: bookRefs[1].title,
      memberName: memberRefs[3].name,
      issuedAt: subDays(new Date(), 30).toISOString(),
      dueDate: subDays(new Date(), 16).toISOString(),
      returnedAt: subDays(new Date(), 10).toISOString(),
      fine: 12, // 6 days × ₹2
      status: "returned",
    });

    // 4. Another overdue issued book
    await addDoc(collection(db, "transactions"), {
      bookId: bookRefs[5].id,
      memberId: memberRefs[2].id,
      bookTitle: bookRefs[5].title,
      memberName: memberRefs[2].name,
      issuedAt: subDays(new Date(), 18).toISOString(),
      dueDate: subDays(new Date(), 4).toISOString(),
      returnedAt: null,
      fine: 0,
      status: "issued",
    });

    // 5. Active issued for Sneha
    await addDoc(collection(db, "transactions"), {
      bookId: bookRefs[7].id,
      memberId: memberRefs[3].id,
      bookTitle: bookRefs[7].title,
      memberName: memberRefs[3].name,
      issuedAt: subDays(new Date(), 3).toISOString(),
      dueDate: addDays(new Date(), 11).toISOString(),
      returnedAt: null,
      fine: 0,
      status: "issued",
    });

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seed error:", err);
  }
};
