import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import { StudentProvider } from './component/StudentContext';

import Header from './component/Header';
import AddEvent from './component/AddEvent';
import EventList from './component/EventList';
import Info from './component/Info';
import AddStudent from './component/AddStudent';
import StudentList from './component/StudentList';
import Home from './component/Home';
import CourseList from './component/CourseList';
import AddCourses from './component/AddCourses';
import AssignmentList from './component/AssignmentList';
import AddAssignment from './component/AddAssignment';
import ExamList from './component/ExamList';
import AddExam from './component/AddExam';
import Support from './component/Support';
import Dashboard from './component/Dashboard'; // ✅ הייבוא החסר

export default function App() {
  useEffect(() => {
    const defaultStudents = Array.from({ length: 10 }, (_, i) => ({
      firstName: `First${i}`,
      lastName: `Last${i}`,
      studentId: `12345678${i}`,
      email: `student${i}@example.com`,
      academicYear: (i % 4 + 1).toString(),
      degreeProgram: ["Computer Science", "Business Administration", "Psychology", "Engineering"][i % 4],
    }));

    const defaultCourses = Array.from({ length: 10 }, (_, i) => ({
      courseCode: `CS${100 + i}`,
      courseName: `Course ${i}`,
      creditPoints: (i % 5) + 1,
      semester: i % 2 === 0 ? "Semester A" : "Semester B",
      lecturerName: `Lecturer ${i}`,
      lecturerEmail: `lecturer${i}@example.com`,
      degreeProgram: ["Computer Science", "Business Administration", "Psychology", "Engineering"][i % 4],
      enrolledStudents: [],
    }));

    const defaultAssignments = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      assignmentName: `Assignment ${i}`,
      description: `Description for Assignment ${i}`,
      dueDate: `2025-06-${(i + 10).toString().padStart(2, '0')}`,
      courseCode: `CS${100 + (i % 10)}`,
    }));

    const defaultExams = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      examName: `Exam ${i}`,
      description: `Description for Exam ${i}`,
      examDate: `2025-07-${(i + 5).toString().padStart(2, '0')}`,
      courseCode: `CS${100 + (i % 10)}`,
    }));

    const defaultEvents = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      eventName: `Event ${i}`,
      description: `Event Description ${i}`,
      eventDate: `2025-08-${(i + 1).toString().padStart(2, '0')}`,
      audienceType: "all",
      audienceValue: "",
    }));

    if (!localStorage.getItem("students")) {
      localStorage.setItem("students", JSON.stringify(defaultStudents));
    }
    if (!localStorage.getItem("courses")) {
      localStorage.setItem("courses", JSON.stringify(defaultCourses));
    }
    if (!localStorage.getItem("assignments")) {
      localStorage.setItem("assignments", JSON.stringify(defaultAssignments));
    }
    if (!localStorage.getItem("exams")) {
      localStorage.setItem("exams", JSON.stringify(defaultExams));
    }
    if (!localStorage.getItem("events")) {
      localStorage.setItem("events", JSON.stringify(defaultEvents));
    }
  }, []);

  return (
    <StudentProvider>
      <Box sx={{ minHeight: '100vh' }}>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/header' element={<Header />} />
          <Route path='/info' element={<Info />} />
          <Route path='/dashboard' element={<Dashboard />} /> {/* ✅ נתיב חדש */}
          <Route path='/studentinfo' element={<AddStudent />} />
          <Route path='/students' element={<StudentList />} />
          <Route path='/courses' element={<CourseList />} />
          <Route path='/add-course' element={<AddCourses />} />
          <Route path='/add-student' element={<AddStudent />} />
          <Route path='/assignments' element={<AssignmentList />} />
          <Route path='/add-assignment' element={<AddAssignment />} />
          <Route path='/exams' element={<ExamList />} />
          <Route path='/add-exam' element={<AddExam />} />
          <Route path='/events' element={<EventList />} />
          <Route path='/add-event' element={<AddEvent />} />
          <Route path='/support' element={<Support />} />
        </Routes>
      </Box>
    </StudentProvider>
  );
}
