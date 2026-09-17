// Firestore CRUD helpers for the Members collection
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "members";

/**
 * Real-time listener on all members, ordered by name
 */
export const subscribeToMembers = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy("name"));
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(members);
  });
};

/**
 * Add a new member
 */
export const addMember = async (memberData) => {
  return await addDoc(collection(db, COLLECTION), {
    ...memberData,
    issuedBooks: 0,
    createdAt: serverTimestamp(),
  });
};

/**
 * Update a member by ID
 */
export const updateMember = async (id, memberData) => {
  const ref = doc(db, COLLECTION, id);
  return await updateDoc(ref, { ...memberData, updatedAt: serverTimestamp() });
};

/**
 * Delete a member by ID
 */
export const deleteMember = async (id) => {
  return await deleteDoc(doc(db, COLLECTION, id));
};

/**
 * Fetch all members once (used for seeding check)
 */
export const fetchAllMembers = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
