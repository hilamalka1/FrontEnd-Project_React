import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Alert,
  Stack
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc,
  updateDoc,
  collection,
  doc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function AddStudent() {
  const location = useLocation();
  const navigate = useNavigate();
  const editingStudent = location.state?.student || null;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    academicYear: "",
    degreeProgram: "",
    id: null,
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const degreeOptions = [
    "Computer Science",
    "Software Engineering",
    "Business Administration",
    "Biology",
    "Psychology",
    "Economics",
    "Education",
    "Architecture",
  ];

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        id: editingStudent.id || null,
        firstName: editingStudent.firstName || "",
        lastName: editingStudent.lastName || "",
        studentId: editingStudent.studentId || "",
        email: editingStudent.email || "",
        academicYear: editingStudent.academicYear || "",
        degreeProgram: editingStudent.degreeProgram || "",
      });
    }
  }, [editingStudent]);

  const validateName = (name) => /^[\u0590-\u05FFa-zA-Z]{2,}$/.test(name);
  const validateStudentId = (id) => /^\d{9}$/.test(id);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {};
    setGeneralError("");

    if (!validateName(formData.firstName)) newErrors.firstName = "First name must be at least 2 letters (Hebrew or English).";
    if (!validateName(formData.lastName)) newErrors.lastName = "Last name must be at least 2 letters (Hebrew or English).";
    if (!validateStudentId(formData.studentId)) newErrors.studentId = "Student ID must be exactly 9 digits.";
    if (!validateEmail(formData.email)) newErrors.email = "Invalid email format.";
    const year = Number(formData.academicYear);
    if (!year || year < 1 || year > 6) newErrors.academicYear = "Academic year must be between 1 and 6.";
    if (!formData.degreeProgram) newErrors.degreeProgram = "Degree program is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStudentIdUnique = async () => {
    const q = query(collection(firestore, "students"), where("studentId", "==", formData.studentId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;
    if (editingStudent) {
      return snapshot.docs.every((docSnap) => docSnap.id === editingStudent.id);
    }
    return false;
  };

  const isEmailUnique = async () => {
    const q = query(collection(firestore, "students"), where("email", "==", formData.email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;
    if (editingStudent) {
      return snapshot.docs.every((docSnap) => docSnap.id === editingStudent.id);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const [idUnique, emailUnique] = await Promise.all([
        isStudentIdUnique(),
        isEmailUnique()
      ]);

      if (!idUnique) {
        setGeneralError("Student ID must be unique.");
        setLoading(false);
        return;
      }
      if (!emailUnique) {
        setGeneralError("Email address must be unique.");
        setLoading(false);
        return;
      }

      const { id, ...studentData } = formData;
      if (editingStudent && id) {
        await updateDoc(doc(firestore, "students", id), studentData);
      } else {
        await addDoc(collection(firestore, "students"), studentData);
      }
      navigate("/students");
    } catch (error) {
      console.error("Error saving student:", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGeneralError("");

    const liveErrors = { ...errors };

    if (name === "firstName" && !validateName(value)) {
      liveErrors.firstName = "First name must be at least 2 letters (Hebrew or English).";
    } else if (name === "lastName" && !validateName(value)) {
      liveErrors.lastName = "Last name must be at least 2 letters (Hebrew or English).";
    } else if (name === "studentId" && !validateStudentId(value)) {
      liveErrors.studentId = "Student ID must be exactly 9 digits.";
    } else if (name === "email" && !validateEmail(value)) {
      liveErrors.email = "Invalid email format.";
    } else if (name === "academicYear") {
      const year = Number(value);
      if (!year || year < 1 || year > 6) {
        liveErrors.academicYear = "Academic year must be between 1 and 6.";
      } else {
        delete liveErrors.academicYear;
      }
    } else if (name === "degreeProgram" && !value) {
      liveErrors.degreeProgram = "Degree program is required.";
    } else {
      delete liveErrors[name];
    }

    setErrors(liveErrors);
  };

  const handleCancel = () => {
    navigate("/students");
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        {editingStudent ? "Edit Student" : "Add New Student"}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 600,
          mx: "auto",
          p: 4,
          gap: 2,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        {generalError && <Alert severity="error">{generalError}</Alert>}

        <TextField label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} fullWidth />
        <TextField label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} fullWidth />
        <TextField label="Student ID *" name="studentId" value={formData.studentId} onChange={handleChange} error={!!errors.studentId} helperText={errors.studentId} inputProps={{ maxLength: 9 }} fullWidth />
        <TextField label="Email *" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} fullWidth />
        <TextField label="Academic Year (1–6) *" name="academicYear" value={formData.academicYear} onChange={handleChange} error={!!errors.academicYear} helperText={errors.academicYear} type="number" inputProps={{ min: 1, max: 6 }} fullWidth />

        <FormControl fullWidth required error={!!errors.degreeProgram}>
          <InputLabel>Degree Program</InputLabel>
          <Select name="degreeProgram" value={formData.degreeProgram} label="Degree Program" onChange={handleChange}>
            {degreeOptions.map((degree, index) => (
              <MenuItem key={index} value={degree}>{degree}</MenuItem>
            ))}
          </Select>
          {errors.degreeProgram && <FormHelperText>{errors.degreeProgram}</FormHelperText>}
        </FormControl>

        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 140, bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : editingStudent ? "Update" : "Add"}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outlined"
            sx={{ minWidth: 140, borderColor: "#4caf50", color: "#4caf50", '&:hover': { bgcolor: "#e8f5e9" } }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
