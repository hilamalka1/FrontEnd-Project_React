import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAssignment = location.state?.assignment || null;

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    assignmentName: "",
    description: "",
    dueDate: "",
    courseCode: "",
  });

  const [error, setError] = useState({});

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }

    if (editingAssignment) {
      setFormData({
        assignmentName: editingAssignment.assignmentName,
        description: editingAssignment.description,
        dueDate: editingAssignment.dueDate,
        courseCode: editingAssignment.courseCode,
      });
    }
  }, [editingAssignment]);

  const validateField = (name, value) => {
    let msg = "";
    const trimmed = typeof value === "string" ? value.trim() : value;
    if (!trimmed) {
      msg = "This field is required";
    }
    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    setError((prev) => ({ ...prev, [name]: msg }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });

    setError(newErrors);

    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) {
      alert("Please fill in all fields correctly");
      return;
    }

    const saved = localStorage.getItem('assignments');
    const assignmentsArray = saved ? JSON.parse(saved) : [];

    let updated;
    if (editingAssignment) {
      updated = assignmentsArray.map(a =>
        a.id === editingAssignment.id
          ? { ...a, ...formData }
          : a
      );
    } else {
      const newAssignment = {
        ...formData,
        id: Date.now(),
        submittedStudents: []
      };
      updated = [...assignmentsArray, newAssignment];
    }

    localStorage.setItem("assignments", JSON.stringify(updated));
    alert("Assignment saved successfully!");
    navigate("/assignments");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSave}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 500,
        mx: "auto",
        p: 4,
        gap: 2,
      }}
    >
      <Typography variant="h5" align="center">
        {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
      </Typography>

      <TextField
        label="Assignment Name *"
        name="assignmentName"
        value={formData.assignmentName}
        onChange={handleChange}
        error={!!error.assignmentName}
        helperText={error.assignmentName}
      />

      <TextField
        label="Description *"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={!!error.description}
        helperText={error.description}
        multiline
        rows={3}
      />

      <TextField
        label="Due Date *"
        name="dueDate"
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
        error={!!error.dueDate}
        helperText={error.dueDate}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <TextField
        select
        label="Select Course *"
        name="courseCode"
        value={formData.courseCode}
        onChange={handleChange}
        error={!!error.courseCode}
        helperText={error.courseCode}
      >
        {courses.length > 0 ? courses.map((course, index) => (
          <MenuItem key={index} value={course.courseCode}>
            {course.courseName} ({course.courseCode})
          </MenuItem>
        )) : (
          <MenuItem disabled>No courses available</MenuItem>
        )}
      </TextField>

      <Button variant="contained" type="submit">
        {editingAssignment ? "Update Assignment" : "Save Assignment"}
      </Button>
      <Button variant="outlined" onClick={() => navigate("/assignments")}>
        Cancel
      </Button>
    </Box>
  );
}
