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
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">Assignment Management</Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Link to="/add-assignment">
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ backgroundColor: "#66bb6a", '&:hover': { backgroundColor: "#4caf50" } }}
          >
            Add New Assignment
          </Button>
        </Link>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Assignment Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
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
                  <IconButton onClick={() => handleEdit(a)} title="Edit"><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(a.id)} color="error" title="Delete"><Delete /></IconButton>
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
