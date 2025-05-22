import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addAssignment,
  updateAssignment,
} from "../firebase/Assignments";

export default function AddAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAssignment = location.state?.assignment || null;

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    assignmentName: "",
    description: "",
    dueDate: "",
    courseCode: "",
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]");
    setCourses(savedCourses);

    if (editingAssignment) {
      console.log("Loaded for editing:", editingAssignment);
      setFormData({
        assignmentName: editingAssignment.assignmentName || "",
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
    const requiredFields = ["assignmentName", "description", "dueDate", "courseCode"];
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
        alert("Assignment updated successfully!");
      } else {
        await addAssignment({ ...formData, submittedStudents: [] });
        alert("Assignment saved successfully!");
      }
      navigate("/assignments");
    } catch (error) {
      console.error("Error saving assignment:", error);
      alert("Error saving assignment");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <LinearProgress sx={{ width: "80%" }} />
    </Box>
  ) : (
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
        label="Assignment Name *"
        name="assignmentName"
        value={formData.assignmentName}
        onChange={handleChange}
        error={!!error.assignmentName}
        helperText={error.assignmentName}
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

      <Button
        variant="contained"
        type="submit"
        sx={{ bgcolor: "#81c784", "&:hover": { bgcolor: "#66bb6a" } }}
      >
        {editingAssignment ? "Update Assignment" : "Save Assignment"}
      </Button>

      <Button
        variant="outlined"
        onClick={() => navigate("/assignments")}
        sx={{ borderColor: "#81c784", color: "#388e3c" }}
      >
        Cancel
      </Button>
    </Box>
  );
}
