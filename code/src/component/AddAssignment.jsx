import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAssignment = location.state?.assignment || null;

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    assignmentName: "", description: "", dueDate: "", courseCode: ""
  });
  const [error, setError] = useState({});

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]");
    setCourses(savedCourses);
    if (editingAssignment) setFormData({ ...editingAssignment });
  }, [editingAssignment]);

  const validateField = (name, value) => (!value?.toString().trim() ? "This field is required" : "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(formData).forEach(([k, v]) => newErrors[k] = validateField(k, v));
    setError(newErrors);
    if (Object.values(newErrors).some(Boolean)) return alert("Please fill in all fields correctly");

    const saved = JSON.parse(localStorage.getItem("assignments") || "[]");
    const updated = editingAssignment
      ? saved.map((a) => a.id === editingAssignment.id ? { ...a, ...formData } : a)
      : [...saved, { ...formData, id: Date.now(), submittedStudents: [] }];

    localStorage.setItem("assignments", JSON.stringify(updated));
    alert("Assignment saved successfully!");
    navigate("/assignments");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSave}
      sx={{ display: "flex", flexDirection: "column", maxWidth: 500, mx: "auto", my: 4, p: 4, gap: 2, boxShadow: 3, borderRadius: 2, bgcolor: "#f5f5f5", width: "90%" }}
    >
      <Typography variant="h5" align="center" fontWeight="bold">
        {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
      </Typography>

      <TextField
        label="Assignment Name *"
        name="assignmentName"
        value={formData.assignmentName}
        onChange={handleChange}
        error={!!error.assignmentName}
        helperText={error.assignmentName}
        fullWidth
      />

      <TextField
        label="Description *"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={!!error.description}
        helperText={error.description}
        multiline rows={3} fullWidth
      />

      <TextField
        label="Due Date *"
        name="dueDate"
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
        error={!!error.dueDate}
        helperText={error.dueDate}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: new Date().toISOString().split("T")[0] }}
        fullWidth
      />

      <TextField
        select
        label="Select Course *"
        name="courseCode"
        value={formData.courseCode}
        onChange={handleChange}
        error={!!error.courseCode}
        helperText={error.courseCode}
        fullWidth
      >
        {courses.length > 0 ? courses.map((course) => (
          <MenuItem key={course.courseCode} value={course.courseCode}>
            {course.courseName} ({course.courseCode})
          </MenuItem>
        )) : <MenuItem disabled>No courses available</MenuItem>}
      </TextField>

      <Button variant="contained" type="submit" sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}>
        {editingAssignment ? "Update Assignment" : "Save Assignment"}
      </Button>

      <Button variant="outlined" onClick={() => navigate("/assignments")}
        sx={{ borderColor: "#81c784", color: "#388e3c" }}>
        Cancel
      </Button>
    </Box>
  );
}
