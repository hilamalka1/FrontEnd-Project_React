  // firebase/Student.js
  import { addDoc, collection, getDocs, doc, updateDoc } from "firebase/firestore";
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

  // עדכון סטודנט קיים לפי המסמך שלו ב-Firestore
  export async function updateStudent(id, updatedData) {
    const ref = doc(firestore, "students", id);
    return await updateDoc(ref, updatedData);
  }
