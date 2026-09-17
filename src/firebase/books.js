// firebase/books.js — STUB (books handled by localDB.js)
import { getBooks } from "../db/localDB";

export const subscribeToBooks = (callback) => {
  callback(getBooks());
  return () => {};
};
export const addBook = async () => {};
export const updateBook = async () => {};
export const deleteBook = async () => {};
export const fetchAllBooks = async () => getBooks();
