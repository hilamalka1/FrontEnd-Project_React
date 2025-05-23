import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, LinearProgress
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  listAssignments,
  deleteAssignment
} from "../firebase/Assignments";

export default function AssignmentList() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAssignments()
      .then((data) => setAssignments(data))
      .catch((err) => {
        console.error("Error loading assignments:", err);
        alert("Failed to load assignments");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (assignment) => {
    navigate("/add-assignment", { state: { assignment } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      alert("Assignment deleted successfully!");
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Error deleting assignment");
    }
  };

  return loading ? (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <LinearProgress sx={{ width: "80%" }} />
    </Box>
  ) : (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        Assignment Management
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: "#81c784", "&:hover": { bgcolor: "#66bb6a" } }}
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
            {assignments.length > 0 ? (
              assignments.map((a) => (
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
              ))
            ) : (
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
