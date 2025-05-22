import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { firestore } from "./firebaseConfig";

// הוספת קורס חדש
export async function addCourse(course) {
  return addDoc(collection(firestore, "courses"), course);
}

// עדכון קורס לפי courseCode
export async function updateCourse(course) {
  const q = query(collection(firestore, "courses"), where("courseCode", "==", course.courseCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("Course not found for update");

  const docRef = snapshot.docs[0].ref;
  return updateDoc(docRef, { ...course });
}

// מחיקת קורס לפי courseCode
export async function deleteCourseByCode(courseCode) {
  const q = query(collection(firestore, "courses"), where("courseCode", "==", courseCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("Course not found for deletion");

  const docRef = snapshot.docs[0].ref;
  return deleteDoc(docRef);
}

// שליפת כל הסטודנטים (לשימוש בטופס)
export async function listStudents() {
  const snapshot = await getDocs(collection(firestore, "students"));
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

// שליפת קורס לפי courseCode (לעריכה)
export async function getCourseByCode(courseCode) {
  const q = query(collection(firestore, "courses"), where("courseCode", "==", courseCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
}
