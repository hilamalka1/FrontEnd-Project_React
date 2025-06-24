import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem,
  CircularProgress, Alert, Stack
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { addAssignment, updateAssignment } from "../firebase/Assignments";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function AddAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAssignment = location.state?.assignment || null;

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    assignmentTitle: "",
    description: "",
    dueDate: "",
    courseCode: ""
  });
  const [error, setError] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const validateField = (name, value) => {
    const val = value?.toString().trim();
    if (!val) return "This field is required";
    if (name === "dueDate") {
      const d = dayjs(val);
      return !d.isValid()
        ? "Invalid date format"
        : d.isBefore(dayjs().startOf("day"))
        ? "Date cannot be in the past"
        : "";
    }
    return "";
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData(f => ({ ...f, [name]: value }));
    setError(e => ({ ...e, [name]: validateField(name, value) }));
    setGeneralError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const requiredFields = ["assignmentTitle", "description", "dueDate", "courseCode"];
    const newErrors = Object.fromEntries(
      requiredFields.map((field) => [field, validateField(field, formData[field])])
    );
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
    } catch (err) {
      console.error("Error saving assignment:", err);
      setGeneralError("Error saving assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/assignments");

  useEffect(() => {
    const init = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "courses"));
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setInitialLoading(false);
      }

      if (editingAssignment) {
        setFormData({
          assignmentTitle: editingAssignment.assignmentTitle || "",
          description: editingAssignment.description || "",
          dueDate: editingAssignment.dueDate || "",
          courseCode: editingAssignment.courseCode || "",
          submittedStudents: editingAssignment.submittedStudents || [],
          id: editingAssignment.id || undefined,
        });
      } else {
        setFormData({
          assignmentTitle: "",
          description: "",
          dueDate: "",
          courseCode: ""
        });
        setError({});
        setGeneralError("");
      }
    };

    init();
  }, [location.pathname]);

  if (initialLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" gap={2}>
        <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" color="textSecondary">Loading assignment data...</Typography>
      </Box>
    );
  }

  const fields = [
    { name: "assignmentTitle", label: "Assignment Title *", multiline: false },
    { name: "description", label: "Description *", multiline: true },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
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

          {fields.map(({ name, label, multiline }) => (
            <TextField
              key={name}
              label={label}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              error={!!error[name]}
              helperText={error[name]}
              multiline={multiline}
              rows={multiline ? 3 : 1}
              fullWidth
            />
          ))}

          <DatePicker
            label="Due Date *"
            value={formData.dueDate ? dayjs(formData.dueDate) : null}
            onChange={(newValue) => {
              const formatted = newValue && newValue.isValid()
                ? newValue.format("YYYY-MM-DD")
                : "";
              handleChange({ target: { name: "dueDate", value: formatted } });
            }}
            disablePast
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error.dueDate,
                helperText: error.dueDate,
              }
            }}
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
      </LocalizationProvider>
    </Box>
  );
}
