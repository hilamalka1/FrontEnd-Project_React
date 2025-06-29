// StudentContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);

  // עדכון אובייקט סטודנט אם יש רשימה ובחירה
  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const student = students.find(
        s => s.studentId === selectedStudentId || s.id === selectedStudentId
      );
      setSelectedStudent(student || null);
    } else {
      setSelectedStudent(null);
    }
  }, [selectedStudentId, students]);

  const updateSelectedStudent = (studentId) => {
    setSelectedStudentId(studentId);
    const student = students.find(
      s => s.studentId === studentId || s.id === studentId
    );
    setSelectedStudent(student || null);
  };

  const updateStudents = (studentsList) => {
    setStudents(studentsList);
  };

  return (
    <StudentContext.Provider
      value={{
        selectedStudentId,
        selectedStudent,
        students,
        updateSelectedStudent,
        updateStudents
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};
