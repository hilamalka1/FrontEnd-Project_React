import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
  Stack
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addAssignment,
  updateAssignment,
} from "../firebase/Assignments";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function AddAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAssignment = location.state?.assignment || null;

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    assignmentTitle: "",
    description: "",
    dueDate: "",
    courseCode: "",
  });
  const [error, setError] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "courses"));
        const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(courseList);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCourses();

    if (editingAssignment) {
      setFormData({
        assignmentTitle: editingAssignment.assignmentTitle || "",
        description: editingAssignment.description || "",
        dueDate: editingAssignment.dueDate || "",
        courseCode: editingAssignment.courseCode || "",
        submittedStudents: editingAssignment.submittedStudents || [],
        id: editingAssignment.id || undefined,
      });
    }
  }, [editingAssignment]);

  const validateField = (name, value) =>
    !value?.toString().trim() ? "This field is required" : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setGeneralError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const requiredFields = ["assignmentTitle", "description", "dueDate", "courseCode"];
    const newErrors = {};

    requiredFields.forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    setError(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      setGeneralError("Please fill in all fields correctly");
      return;
    }

    setLoading(true);
    try {
      if (editingAssignment) {
        await updateAssignment(formData);
      } else {
        await addAssignment({ ...formData, submittedStudents: [] });
      }
      navigate("/assignments");
    } catch (error) {
      console.error("Error saving assignment:", error);
      setGeneralError("Error saving assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/assignments");
  };

  if (initialLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="80vh"
        gap={2}
      >
        <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" color="textSecondary">
          Loading assignment form...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSave}
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

        <TextField
          label="Assignment Title *"
          name="assignmentTitle"
          value={formData.assignmentTitle}
          onChange={handleChange}
          error={!!error.assignmentTitle}
          helperText={error.assignmentTitle}
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
          label="Due Date *"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          error={!!error.dueDate}
          helperText={error.dueDate}
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
          {courses.length > 0 ? (
            courses.map((course) => (
              <MenuItem key={course.courseCode} value={course.courseCode}>
                {course.courseName} ({course.courseCode})
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No courses available</MenuItem>
          )}
        </TextField>

        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 140, bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : editingAssignment ? "Update" : "Save"}
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
