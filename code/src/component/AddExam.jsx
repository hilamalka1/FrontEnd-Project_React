import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddExam() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingExam = location.state?.exam || null;

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    examName: "",
    description: "",
    examDate: "",
    courseCode: "",
  });
  const [error, setError] = useState({});

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) setCourses(JSON.parse(savedCourses));

    if (editingExam) {
      setFormData({
        examName: editingExam.examName,
        description: editingExam.description,
        examDate: editingExam.examDate,
        courseCode: editingExam.courseCode,
      });
    }
  }, [editingExam]);

  const validateField = (name, value) => {
    const trimmed = typeof value === "string" ? value.trim() : value;
    return !trimmed ? "This field is required" : "";
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
    if (Object.values(newErrors).some(Boolean)) {
      alert("Please fill in all fields correctly");
      return;
    }

    const saved = localStorage.getItem('exams');
    const examsArray = saved ? JSON.parse(saved) : [];
    const updated = editingExam
      ? examsArray.map(e => e.id === editingExam.id ? { ...e, ...formData } : e)
      : [...examsArray, { ...formData, id: Date.now(), submittedStudents: [] }];

    localStorage.setItem("exams", JSON.stringify(updated));
    alert("Exam saved successfully!");
    navigate("/exams");
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
        my: 4,
        p: 4,
        gap: 2,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="h5" align="center" fontWeight="bold">
        {editingExam ? "Edit Exam" : "Add New Exam"}
      </Typography>

      <TextField
        label="Exam Name *"
        name="examName"
        value={formData.examName}
        onChange={handleChange}
        error={!!error.examName}
        helperText={error.examName}
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
        label="Exam Date *"
        name="examDate"
        type="date"
        value={formData.examDate}
        onChange={handleChange}
        error={!!error.examDate}
        helperText={error.examDate}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: new Date().toISOString().split("T")[0] }}
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
        {courses.length > 0 ? courses.map((c, i) => (
          <MenuItem key={i} value={c.courseCode}>
            {c.courseName} ({c.courseCode})
          </MenuItem>
        )) : (
          <MenuItem disabled>No courses available</MenuItem>
        )}
      </TextField>

      <Button
        variant="contained"
        type="submit"
        sx={{ backgroundColor: "#66bb6a", '&:hover': { backgroundColor: "#4caf50" } }}
      >
        {editingExam ? "Update Exam" : "Save Exam"}
      </Button>

      <Button variant="outlined" onClick={() => navigate("/exams")}>Cancel</Button>
    </Box>
  );
}