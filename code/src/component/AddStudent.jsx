import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    academicYear: "",
    degreeProgram: "",
  });

  const [error, setError] = useState({});
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("students");
    if (saved) {
      setStudents(JSON.parse(saved));
    }
  }, []);

  const validateField = (name, value) => {
    let msg = "";

    if (!value.trim()) {
      msg = "This field is required";
    } else {
      if ((name === "firstName" || name === "lastName") && !/^[A-Za-z\u0590-\u05FF]{2,}$/.test(value)) {
        msg = "Only Hebrew or English letters allowed, min 2 characters";
      }
      if (name === "studentId") {
        if (!/^\d{9}$/.test(value)) msg = "Student ID must be 9 digits";
      }
      if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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

    const updated = [...students, formData];
    setStudents(updated);
    localStorage.setItem("students", JSON.stringify(updated));
    alert("Student added successfully!");
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
        p: 4,
        gap: 2,
      }}
    >
      <Typography variant="h5" align="center">
        Add New Student
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

      <Button variant="contained" type="submit">
        Save
      </Button>
      <Button variant="outlined" onClick={() => navigate(-1)}>
        Exit
      </Button>
    </Box>
  );
}