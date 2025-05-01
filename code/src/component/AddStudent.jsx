import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const academicYears = ["1", "2", "3", "4"];
const degreePrograms = [
  "Computer Science",
  "Software Engineering",
  "Business Administration",
  "Biology",
  "Psychology",
  "Economics",
  "Education",
  "Architecture"
];

export default function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingStudent = location.state?.student || null;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    academicYear: "",
    degreeProgram: "",
  });

  const [error, setError] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setFormData(editingStudent);
    }
  }, [editingStudent]);

  const validateField = (name, value) => {
    let msg = "";
    const trimmed = value.trim();

    if (!trimmed) {
      msg = "This field is required";
    } else {
      if ((name === "firstName" || name === "lastName") &&
        !/^[A-Za-z\u0590-\u05FF\s]{2,}$/.test(trimmed)) {
        msg = "Only Hebrew or English letters allowed, min 2 characters";
      }

      if (name === "studentId") {
        if (!/^\d*$/.test(trimmed)) {
          msg = "Only digits are allowed in Student ID";
        } else if (trimmed.length !== 9) {
          msg = "Student ID must be exactly 9 digits";
        }
      }

      if (name === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        msg = "Invalid email format";
      }
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
      alert("Please fix all errors before submitting");
      return;
    }

    const saved = localStorage.getItem("students");
    const studentsArray = saved ? JSON.parse(saved) : [];

    const existingStudent = studentsArray.find(
      (s) => s.studentId === formData.studentId
    );

    if (!editingStudent && existingStudent) {
      alert("Student ID already exists. Please use a unique ID.");
      return;
    }

    const updated = editingStudent
      ? studentsArray.map((s) =>
          s.studentId === formData.studentId ? formData : s
        )
      : [...studentsArray, formData];

    localStorage.setItem("students", JSON.stringify(updated));
    alert("Student saved successfully!");
    navigate("/students");
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
      <Typography variant="h5" align="center">
        {editingStudent ? "Edit Student" : "Add New Student"}
      </Typography>

      <TextField
        label="First Name *"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        error={!!error.firstName}
        helperText={error.firstName}
      />

      <TextField
        label="Last Name *"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={!!error.lastName}
        helperText={error.lastName}
      />

      <TextField
        label="Student ID (9 digits) *"
        name="studentId"
        value={formData.studentId}
        onChange={handleChange}
        error={!!error.studentId}
        helperText={error.studentId}
        disabled={!!editingStudent}
      />

      <TextField
        label="Email *"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={!!error.email}
        helperText={error.email}
      />

      <TextField
        select
        label="Academic Year *"
        name="academicYear"
        value={formData.academicYear}
        onChange={handleChange}
        error={!!error.academicYear}
        helperText={error.academicYear}
      >
        {academicYears.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Degree Program *"
        name="degreeProgram"
        value={formData.degreeProgram}
        onChange={handleChange}
        error={!!error.degreeProgram}
        helperText={error.degreeProgram}
      >
        {degreePrograms.map((program, index) => (
          <MenuItem key={index} value={program}>
            {program}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="contained"
        type="submit"
        sx={{
          backgroundColor: "#66bb6a",
          '&:hover': { backgroundColor: "#4caf50" }
        }}
      >
        Save
      </Button>

      <Button
        variant="outlined"
        onClick={() => navigate("/students")}
      >
        Exit
      </Button>
    </Box>
  );
}
