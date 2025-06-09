import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, CircularProgress,
  FormHelperText, Stack, Alert, useMediaQuery, Paper
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useTheme } from "@mui/material/styles";

export default function AddExam() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const editingExam = location.state?.exam || null;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [formData, setFormData] = useState({
    examName: "",
    description: "",
    examDate: "",
    courseCode: "",
  });

  const [error, setError] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseSnap = await getDocs(collection(firestore, "courses"));
        setCourses(courseSnap.docs.map(doc => doc.data()));
        if (editingExam) {
          setFormData({
            examName: editingExam.examName,
            description: editingExam.description,
            examDate: editingExam.examDate,
            courseCode: editingExam.courseCode,
          });
        }
      } catch (err) {
        console.error("Error loading courses:", err);
        setGeneralError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [editingExam]);

  const validateField = (name, value) => {
    if (!value || (typeof value === "string" && value.trim() === "")) return "This field is required";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setGeneralError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setError(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const dataToSave = {
      ...formData,
      submittedStudents: editingExam?.submittedStudents || [],
    };

    setSaving(true);
    try {
      if (editingExam?.id) {
        const ref = doc(firestore, "exams", editingExam.id);
        await updateDoc(ref, dataToSave);
        alert("Exam updated successfully!");
      } else {
        await addDoc(collection(firestore, "exams"), dataToSave);
        alert("Exam saved successfully!");
      }
      navigate("/exams");
    } catch (error) {
      console.error("Error saving exam:", error);
      setGeneralError("Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" gap={2}>
        <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" color="textSecondary">Loading form data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant={isMobile ? "h5" : "h4"} align="center" mb={3} fontWeight="bold">
        {editingExam ? "Edit Exam" : "Add New Exam"}
      </Typography>

      <Paper component="form" onSubmit={handleSave} sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 600,
        mx: "auto",
        p: 4,
        gap: 2,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#ffffff",
      }}>
        {generalError && <Alert severity="error">{generalError}</Alert>}

        <TextField label="Exam Name *" name="examName" value={formData.examName} onChange={handleChange} error={!!error.examName} helperText={error.examName} fullWidth />
        <TextField label="Description *" name="description" value={formData.description} onChange={handleChange} error={!!error.description} helperText={error.description} multiline rows={3} fullWidth />
        <TextField label="Exam Date *" name="examDate" type="date" value={formData.examDate} onChange={handleChange} error={!!error.examDate} helperText={error.examDate} InputLabelProps={{ shrink: true }} fullWidth />

        <TextField select label="Select Course *" name="courseCode" value={formData.courseCode} onChange={handleChange} error={!!error.courseCode} helperText={error.courseCode} fullWidth>
          {courses.length > 0 ? courses.map((c, i) => (
            <MenuItem key={i} value={c.courseCode}>
              {c.courseName} ({c.courseCode})
            </MenuItem>
          )) : (
            <MenuItem disabled>No courses available</MenuItem>
          )}
        </TextField>

        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 140, bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}>
            {saving ? <CircularProgress size={24} sx={{ color: "white" }} /> : (editingExam ? "Update Exam" : "Add Exam")}
          </Button>

          <Button onClick={() => navigate("/exams")} variant="outlined" sx={{ minWidth: 140, borderColor: "#4caf50", color: "#4caf50", '&:hover': { bgcolor: "#e8f5e9" } }}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
