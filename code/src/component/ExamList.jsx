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
  IconButton
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";

export default function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("exams");
    if (saved) {
      setExams(JSON.parse(saved));
    }
  }, []);

  const handleEdit = (exam) => {
    navigate("/add-exam", { state: { exam } });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this exam?");
    if (!confirmDelete) return;

    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    localStorage.setItem("exams", JSON.stringify(updated));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Exam Management
      </Typography>

      <Box mb={2}>
        <Link to="/add-exam">
          <Button variant="contained" startIcon={<Add />}>
            Add New Exam
          </Button>
        </Link>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Exam Date</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.examName}</TableCell>
                <TableCell>{exam.description}</TableCell>
                <TableCell>{exam.examDate}</TableCell>
                <TableCell>{exam.courseCode}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(exam)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(exam.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
