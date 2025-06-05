import React from "react";
import { Button, Box } from "@mui/material";
import { firestore } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function DemoDataGenerator() {
  const handleGenerate = async () => {
    try {
      // סטודנטים
      for (let i = 0; i < 10; i++) {
        await addDoc(collection(firestore, "students"), {
          studentId: `S10${i}`,
          firstName: `Demo${i}`,
          lastName: `User${i}`,
          email: `demo${i}@mail.com`,
          academicYear: `${(i % 4) + 1}`,
          degreeProgram: ["Computer Science", "Business", "Psychology"][i % 3],
        });
      }

      // קורסים עם סטודנט אחד בכל אחד
      for (let i = 0; i < 10; i++) {
        const student = {
          studentId: `S10${i}`,
          id: `STU${i}`,
          firstName: `Demo${i}`,
          lastName: `User${i}`,
          email: `demo${i}@mail.com`,
          academicYear: `${(i % 4) + 1}`,
          degreeProgram: ["Computer Science", "Business", "Psychology"][i % 3]
        };

        await addDoc(collection(firestore, "courses"), {
          courseCode: `CRS-${100 + i}`,
          courseName: `Demo Course ${i + 1}`,
          creditPoints: (i % 5) + 1,
          semester: ["Semester A", "Semester B", "Summer"][i % 3],
          lecturerName: `Dr. Demo ${i}`,
          lecturerEmail: `lecturer${i}@demo.com`,
          degreeProgram: student.degreeProgram,
          enrolledStudents: [student],
        });
      }

      // משימות
      for (let i = 0; i < 5; i++) {
        await addDoc(collection(firestore, "assignments"), {
          assignmentTitle: `Demo Assignment ${i + 1}`,
          description: `Practice assignment ${i + 1}`,
          dueDate: `2025-07-${(i + 5).toString().padStart(2, "0")}`,
          courseCode: `CRS-${100 + (i % 10)}`,
        });
      }

      // מבחנים
      for (let i = 0; i < 5; i++) {
        await addDoc(collection(firestore, "exams"), {
          examName: `Demo Exam ${i + 1}`,
          description: `Exam ${i + 1} description`,
          examDate: `2025-08-${(i + 10).toString().padStart(2, "0")}`,
          courseCode: `CRS-${100 + (i % 10)}`,
        });
      }

      // אירועים
      for (let i = 0; i < 5; i++) {
        await addDoc(collection(firestore, "events"), {
          eventName: `Event ${i + 1}`,
          description: `Event for testing ${i + 1}`,
          eventDate: `2025-09-${(i + 1).toString().padStart(2, "0")}`,
          audienceType: "all",
          audienceValue: "",
        });
      }

      alert("🎉 10 Courses with students and more demo data added!");
    } catch (error) {
      console.error("Error adding demo data:", error);
      alert("❌ Error generating demo data. Check the console for details.");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="contained" color="success" onClick={handleGenerate}>
        Generate Demo Data
      </Button>
    </Box>
  );
}
