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

export default function AssignmentList() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("assignments");
    if (saved) {
      setAssignments(JSON.parse(saved));
    }
  }, []);

  const handleEdit = (assignment) => {
    navigate("/add-assignment", { state: { assignment } });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
    if (!confirmDelete) return;

    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Assignment Management
      </Typography>

      <Box mb={2}>
        <Link to="/add-assignment">
          <Button variant="contained" startIcon={<Add />}>
            Add New Assignment
          </Button>
        </Link>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Assignment Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.assignmentName}</TableCell>
                <TableCell>{assignment.description}</TableCell>
                <TableCell>{assignment.dueDate}</TableCell>
                <TableCell>{assignment.courseCode}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(assignment)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(assignment.id)} color="error">
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
