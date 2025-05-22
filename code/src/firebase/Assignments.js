import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "./firebaseConfig";

// הוספת מטלה חדשה ל-Firestore
export async function addAssignment(assignment) {
  return addDoc(collection(firestore, "assignments"), assignment);
}

// עדכון מטלה קיימת לפי ה-ID
export async function updateAssignment(assignment) {
  const { id, ...data } = assignment;
  const ref = doc(firestore, "assignments", id);
  return updateDoc(ref, data);
}

// שליפת כל המטלות מקולקשן
export async function listAssignments() {
  const snapshot = await getDocs(collection(firestore, "assignments"));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

// שליפת מטלה אחת לפי ID
export async function getAssignment(id) {
  const ref = doc(firestore, "assignments", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

// מחיקת מטלה לפי ID
export async function deleteAssignment(id) {
  const ref = doc(firestore, "assignments", id);
  return deleteDoc(ref);
}
