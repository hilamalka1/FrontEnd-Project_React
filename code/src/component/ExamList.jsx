import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getDocs, deleteDoc, doc, collection } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // מזהה המבחן שנמחק כרגע

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const snap = await getDocs(collection(firestore, "exams"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExams(data);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleEdit = (exam) => navigate("/add-exam", { state: { exam } });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      setDeletingId(id);
      await deleteDoc(doc(firestore, "exams", id));
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting exam:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor="#f9fff9">
        <CircularProgress size={60} color="success" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "with", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        Exam Management
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}
          onClick={() => navigate("/add-exam")}
        >
          Add New Exam
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>
              {["Exam Name", "Description", "Exam Date", "Course Code", "Actions"].map((col) => (
                <TableCell key={col} sx={{ fontWeight: "bold" }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.length > 0 ? exams.map((exam) => (
              <TableRow key={exam.id} hover>
                <TableCell>{exam.examName}</TableCell>
                <TableCell>{exam.description}</TableCell>
                <TableCell>{exam.examDate}</TableCell>
                <TableCell>{exam.courseCode}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(exam)} title="Edit" sx={{ color: "#388e3c" }}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(exam.id)}
                    color="error"
                    title="Delete"
                    disabled={deletingId === exam.id}
                  >
                    {deletingId === exam.id ? (
                      <CircularProgress size={24} color="error" />
                    ) : (
                      <Delete />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No exams available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
