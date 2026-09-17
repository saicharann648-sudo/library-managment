// firebase/members.js — STUB (members handled by localDB.js)
import { getMembers } from "../db/localDB";

export const subscribeToMembers = (callback) => {
  callback(getMembers());
  return () => {};
};
export const addMember = async () => {};
export const updateMember = async () => {};
export const deleteMember = async () => {};
export const fetchAllMembers = async () => getMembers();
