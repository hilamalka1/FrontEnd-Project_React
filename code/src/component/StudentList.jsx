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
import { useNavigate, Link } from "react-router-dom";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
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

  const handleDelete = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;
    const updated = [...students];
    updated.splice(index, 1);
    setStudents(updated);
    localStorage.setItem("students", JSON.stringify(updated));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>Student Management</Typography>

      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={3}>
        <Link to="/add-student">
          <Button variant="contained" startIcon={<Add />}>
            Add Student
          </Button>
        </Link>
        <TextField
          placeholder="Search by name, ID or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '300px' }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Degree Program</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.academicYear}</TableCell>
                <TableCell>{student.degreeProgram}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(student)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(index)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
