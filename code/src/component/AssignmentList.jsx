import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";

export default function AssignmentList() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("assignments");
    if (saved) setAssignments(JSON.parse(saved));
  }, []);

  const handleEdit = (assignment) => navigate("/add-assignment", { state: { assignment } });

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        Assignment Management
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}
          onClick={() => navigate("/add-assignment")}
        >
          Add New Assignment
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>
              {["Assignment Name", "Description", "Due Date", "Course Code", "Actions"].map((col) => (
                <TableCell key={col} sx={{ fontWeight: "bold" }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length > 0 ? assignments.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.assignmentName}</TableCell>
                <TableCell>{a.description}</TableCell>
                <TableCell>{a.dueDate}</TableCell>
                <TableCell>{a.courseCode}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(a)} title="Edit" sx={{ color: "#388e3c" }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(a.id)} color="error" title="Delete">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No assignments available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
