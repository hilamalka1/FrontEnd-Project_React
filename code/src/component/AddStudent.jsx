import React, { useEffect, useState } from "react";
import {
  Box, TextField, Button, Typography, CircularProgress, MenuItem,
  Select, InputLabel, FormControl, FormHelperText, Alert, Stack
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc, updateDoc, collection, doc, getDocs, query, where
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function AddStudent() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingStudent = state?.student || null;

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", studentId: "", email: "",
    academicYear: "", degreeProgram: "", id: null
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const degreeOptions = [
    "Computer Science", "Software Engineering", "Business Administration",
    "Biology", "Psychology", "Economics", "Education", "Architecture"
  ];

  const validators = {
    firstName: { fn: v => /^[\u0590-\u05FFa-zA-Z]{2,}$/.test(v), msg: "First name must be at least 2 letters (Hebrew or English)." },
    lastName: { fn: v => /^[\u0590-\u05FFa-zA-Z]{2,}$/.test(v), msg: "Last name must be at least 2 letters (Hebrew or English)." },
    studentId: { fn: v => /^\d{9}$/.test(v), msg: "Student ID must be exactly 9 digits." },
    email: { fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Invalid email format." },
    academicYear: { fn: v => Number(v) >= 1 && Number(v) <= 6, msg: "Academic year must be between 1 and 6." },
    degreeProgram: { fn: v => !!v, msg: "Degree program is required." }
  };

  useEffect(() => {
    const loadStudent = async () => {
      setLoading(true);
      if (editingStudent) {
        setFormData({
          ...editingStudent,
          id: editingStudent.id || null
        });
      }
      setLoading(false);
    };
    loadStudent();
  }, [editingStudent]);

  const validate = () => {
    const newErrors = {};
    Object.entries(validators).forEach(([key, { fn, msg }]) => {
      if (!fn(formData[key])) newErrors[key] = msg;
    });
    setErrors(newErrors);
    setGeneralError("");
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setGeneralError("");
    if (validators[name]) {
      const isValid = validators[name].fn(value);
      setErrors(prev => ({
        ...prev,
        [name]: isValid ? undefined : validators[name].msg
      }));
    }
  };

  const isUnique = async (field) => {
    const q = query(collection(firestore, "students"), where(field, "==", formData[field]));
    const snap = await getDocs(q);
    if (snap.empty) return true;
    if (editingStudent) return snap.docs.every(d => d.id === editingStudent.id);
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const [idOK, emailOK] = await Promise.all([isUnique("studentId"), isUnique("email")]);
      if (!idOK) return setGeneralError("Student ID must be unique."), setLoading(false);
      if (!emailOK) return setGeneralError("Email address must be unique."), setLoading(false);

      const { id, ...student } = formData;
      const ref = collection(firestore, "students");
      editingStudent && id
        ? await updateDoc(doc(ref, id), student)
        : await addDoc(ref, student);

      navigate("/students");
    } catch (err) {
      console.error(err);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" gap={2}>
        <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" color="textSecondary">Loading student data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        {editingStudent ? "Edit Student" : "Add New Student"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{
        display: "flex", flexDirection: "column", maxWidth: 600,
        mx: "auto", p: 4, gap: 2, boxShadow: 3, borderRadius: 2,
        backgroundColor: "#ffffff"
      }}>
        {generalError && <Alert severity="error">{generalError}</Alert>}

        <TextField label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} fullWidth />
        <TextField label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} fullWidth />
        <TextField label="Student ID *" name="studentId" value={formData.studentId} onChange={handleChange} error={!!errors.studentId} helperText={errors.studentId} inputProps={{ maxLength: 9 }} fullWidth />
        <TextField label="Email *" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} fullWidth />
        <TextField label="Academic Year (1–6) *" name="academicYear" value={formData.academicYear} onChange={handleChange} error={!!errors.academicYear} helperText={errors.academicYear} type="number" inputProps={{ min: 1, max: 6 }} fullWidth />

        <FormControl fullWidth required error={!!errors.degreeProgram}>
          <InputLabel>Degree Program</InputLabel>
          <Select name="degreeProgram" value={formData.degreeProgram} label="Degree Program" onChange={handleChange}>
            {degreeOptions.map((deg, i) => <MenuItem key={i} value={deg}>{deg}</MenuItem>)}
          </Select>
          {errors.degreeProgram && <FormHelperText>{errors.degreeProgram}</FormHelperText>}
        </FormControl>

        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button type="submit" variant="contained" disabled={loading}
            sx={{ minWidth: 140, bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}>
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : editingStudent ? "Update" : "Add"}
          </Button>
          <Button onClick={() => navigate("/students")} variant="outlined"
            sx={{ minWidth: 140, borderColor: "#4caf50", color: "#4caf50", '&:hover': { bgcolor: "#e8f5e9" } }}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
