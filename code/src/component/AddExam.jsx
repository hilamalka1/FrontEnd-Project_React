// AddExam.jsx - שומר מבחנים ב-Firestore ומושך קורסים משם
import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

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
    const fetchCourses = async () => {
      const courseSnap = await getDocs(collection(firestore, "courses"));
      setCourses(courseSnap.docs.map(doc => doc.data()));
    };
    fetchCourses();

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

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setError(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    const dataToSave = {
      ...formData,
      submittedStudents: editingExam?.submittedStudents || [],
    };

    try {
      if (editingExam?.id) {
        const ref = doc(firestore, "exams", editingExam.id);
        await updateDoc(ref, dataToSave);
      } else {
        await addDoc(collection(firestore, "exams"), dataToSave);
      }
      navigate("/exams");
    } catch (error) {
      console.error("Error saving exam:", error);
    }
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
        width: "90%"
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
        fullWidth
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
        fullWidth
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
        sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}
      >
        {editingExam ? "Update Exam" : "Save Exam"}
      </Button>

      <Button
        variant="outlined"
        onClick={() => navigate("/exams")}
        sx={{ borderColor: "#81c784", color: "#388e3c" }}
      >
        Cancel
      </Button>
    </Box>
  );
}
