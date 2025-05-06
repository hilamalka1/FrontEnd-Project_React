import { addDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "./firebaseConfig";

// הוספת סטודנט חדש
export async function addStudent(student) {
  return await addDoc(collection(firestore, "students"), student);
}

// שליפת כל הסטודנטים
export async function getAllStudents() {
  const snapshot = await getDocs(collection(firestore, "students"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
