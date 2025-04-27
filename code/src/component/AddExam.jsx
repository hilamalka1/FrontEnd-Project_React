import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem
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
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }

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

    const saved = localStorage.getItem('exams');
    const examsArray = saved ? JSON.parse(saved) : [];

    let updated;
    if (editingExam) {
      updated = examsArray.map(e =>
        e.id === editingExam.id
          ? { ...e, ...formData }
          : e
      );
    } else {
      const newExam = {
        ...formData,
        id: Date.now(),
        submittedStudents: []
      };
      updated = [...examsArray, newExam];
    }

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
        p: 4,
        gap: 2,
      }}
    >
      <Typography variant="h5" align="center">
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
        {editingExam ? "Update Exam" : "Save Exam"}
      </Button>
      <Button variant="outlined" onClick={() => navigate("/exams")}>
        Cancel
      </Button>
    </Box>
  );
}
