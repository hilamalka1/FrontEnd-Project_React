// StudentList.jsx - גרסה מתוקנת עם שליפה מ-Firestore
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "students"));
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter((s) =>
    [s.firstName, s.lastName, s.studentId, s.email]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleEdit = (student) => {
    navigate("/add-student", { state: { student } });
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteDoc(doc(firestore, "students", studentId));
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3} align="center" fontWeight="bold">
        Student Management
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={2}
        mb={3}
        flexWrap="wrap"
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}
          onClick={() => navigate("/add-student")}
        >
          Add Student
        </Button>

        <TextField
          placeholder="Search by name, ID or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: '300px' } }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>
              {["First Name", "Last Name", "Student ID", "Email", "Academic Year", "Degree Program", "Actions"].map((col) => (
                <TableCell key={col} sx={{ fontWeight: "bold" }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((student) => (
              <TableRow key={student.id} hover>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.academicYear}</TableCell>
                <TableCell>{student.degreeProgram}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(student)}
                    sx={{ color: "#388e3c" }}
                    aria-label="edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(student.id)}
                    color="error"
                    aria-label="delete"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
