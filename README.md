# 📚 School Library Management System

A modern, full-stack Library Management System built with **React + Vite**, **Tailwind CSS**, and **Firebase** (Firestore + Auth).

---

## ✨ Features

- 🔐 **Authentication** — Librarian login via Firebase Auth
- 📊 **Dashboard** — Live stats, bar chart, pie chart, and activity feed
- 📚 **Book Management** — Add, edit, delete, search, and filter books with availability tracking
- 👥 **Member Management** — Add/edit/delete students with issued book count
- 📤 **Issue & Return** — Issue books to members, return with automatic ₹2/day fine calculation
- 📋 **Reports** — Issued, overdue, fine collection, and returned book reports with CSV export
- 🌙 **Dark/Light Mode** — System-aware, persisted to localStorage

---

## 🚀 Local Setup

### Step 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it (e.g. `school-library`)
3. In the project, go to **Authentication** → **Sign-in method** → enable **Email/Password**
4. Go to **Firestore Database** → **Create database** → start in **test mode**
5. Go to **Project Settings** → **Your apps** → click **</>** (Web)
6. Register the app and copy the `firebaseConfig` object

### Step 2 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and paste your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

### Step 3 — Create a Librarian Account

In Firebase Console → Authentication → Users → **Add user**:
- Email: `librarian@school.edu`
- Password: `library@123` (or anything you like)

### Step 4 — Install & Run

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

> 💡 **Sample data is seeded automatically** on your first login — 10 books, 5 members, and demo transactions (including overdue books for testing).

---

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout.jsx        # Sidebar + topbar
│   ├── StatsCard.jsx     # Dashboard stat cards
│   ├── BookModal.jsx     # Add/edit book form
│   ├── MemberModal.jsx   # Add/edit member form
│   ├── IssueModal.jsx    # Issue book form
│   ├── ReturnModal.jsx   # Return + fine display
│   └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx   # Firebase Auth state
│   └── ThemeContext.jsx  # Dark/light mode
├── firebase/
│   ├── config.js         # Firebase initialization
│   ├── auth.js           # Login/logout helpers
│   ├── books.js          # Book CRUD
│   ├── members.js        # Member CRUD
│   ├── transactions.js   # Issue/return logic
│   └── seed.js           # Sample data seeder
├── hooks/
│   ├── useBooks.js
│   ├── useMembers.js
│   └── useTransactions.js
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Books.jsx
│   ├── Members.jsx
│   ├── Transactions.jsx
│   └── Reports.jsx
└── utils/
    ├── fineCalculator.js # ₹2/day overdue fine
    ├── csvExport.js      # CSV download helper
    └── dateHelpers.js    # Date formatting
```

---

## 🚢 Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # select "dist" as public dir, SPA: yes
npm run build
firebase deploy
```

### Vercel

```bash
npm install -g vercel
vercel
# Follow prompts — Vercel auto-detects Vite
```

Add your `VITE_FIREBASE_*` environment variables in the Vercel dashboard under **Project Settings → Environment Variables**.

---

## 💡 Fine Policy

- **Rate:** ₹2 per day after the due date
- **Default loan period:** 14 days
- **Fine is calculated** when a book is returned and displayed in the Return modal and Reports

---

## 🛠️ Tech Stack

| Layer       | Technology         |
|-------------|-------------------|
| Frontend    | React 18 + Vite   |
| Styling     | Tailwind CSS v3   |
| Database    | Firebase Firestore |
| Auth        | Firebase Auth     |
| Icons       | Lucide React      |
| Charts      | Recharts          |
| Toasts      | React Hot Toast   |
| Routing     | React Router v6   |
| Dates       | date-fns          |
