import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  CircularProgress
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
      return alert("Please fill in all fields correctly");
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
      alert("Error saving assignment");
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
        bgcolor: "#f5f5f5",
        width: "90%",
      }}
    >
      <Typography variant="h5" align="center" fontWeight="bold">
        {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
      </Typography>

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

      <Box display="flex" justifyContent="center" gap={2} mt={2}>
        <Button
          variant="contained"
          type="submit"
          sx={{ bgcolor: "#81c784", "&:hover": { bgcolor: "#66bb6a" }, minWidth: 100 }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : editingAssignment ? "Update" : "Save"}
        </Button>

        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{ borderColor: "#81c784", color: "#388e3c" }}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
