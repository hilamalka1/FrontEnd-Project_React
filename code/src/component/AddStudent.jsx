// src/component/AddStudent.jsx
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { addStudent, updateStudent } from "../firebase/Student";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

const academicYears = ["1", "2", "3", "4"];
const degreePrograms = [
  "Computer Science", "Software Engineering", "Business Administration",
  "Biology", "Psychology", "Economics", "Education", "Architecture"
];

export default function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingStudent = location.state?.student || null;

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", studentId: "",
    email: "", academicYear: "", degreeProgram: ""
  });
  const [error, setError] = useState({});

  useEffect(() => {
    if (editingStudent) setFormData(editingStudent);
  }, [editingStudent]);

  const validateField = (name, value) => {
    const v = value.trim();
    if (!v) return "This field is required";
    if (["firstName", "lastName"].includes(name) && !/^[A-Za-z֐-׿\s]{2,}$/.test(v)) return "Only Hebrew or English letters allowed, min 2 characters";
    if (name === "studentId" && (!/^\d{9}$/.test(v))) return "Student ID must be exactly 9 digits";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email format";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(formData).forEach(([k, v]) => newErrors[k] = validateField(k, v));
    setError(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      if (!editingStudent) {
        const q = query(collection(firestore, "students"), where("studentId", "==", formData.studentId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError((prev) => ({ ...prev, studentId: "Student ID already exists in the system" }));
          return;
        }
        await addStudent(formData);
      } else {
        await updateStudent(editingStudent.id, formData);
      }
      navigate("/students");
    } catch (err) {
      console.error("Error saving student:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", maxWidth: 500, mx: "auto", my: 4, p: 4, gap: 2, boxShadow: 3, borderRadius: 2, bgcolor: "#f5f5f5", width: "90%" }}>
      <Typography variant="h5" align="center" fontWeight="bold">
        {editingStudent ? "Edit Student" : "Add New Student"}
      </Typography>

      <TextField label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} error={!!error.firstName} helperText={error.firstName} fullWidth />
      <TextField label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} error={!!error.lastName} helperText={error.lastName} fullWidth />
      <TextField label="Student ID (9 digits) *" name="studentId" value={formData.studentId} onChange={handleChange} error={!!error.studentId} helperText={error.studentId} disabled={!!editingStudent} fullWidth />
      <TextField label="Email *" name="email" value={formData.email} onChange={handleChange} error={!!error.email} helperText={error.email} fullWidth />
      <TextField select label="Academic Year *" name="academicYear" value={formData.academicYear} onChange={handleChange} error={!!error.academicYear} helperText={error.academicYear} fullWidth>
        {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
      </TextField>
      <TextField select label="Degree Program *" name="degreeProgram" value={formData.degreeProgram} onChange={handleChange} error={!!error.degreeProgram} helperText={error.degreeProgram} fullWidth>
        {degreePrograms.map((program) => <MenuItem key={program} value={program}>{program}</MenuItem>)}
      </TextField>

      <Button type="submit" variant="contained" sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}>Save</Button>
      <Button variant="outlined" onClick={() => navigate("/students")} sx={{ borderColor: "#81c784", color: "#388e3c" }}>Exit</Button>
    </Box>
  );
}
