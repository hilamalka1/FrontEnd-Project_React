import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// אפשרויות לסמסטרים
const semesterOptions = ["Semester A", "Semester B", "Summer"];

// אפשרויות לתארים
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

export default function AddCourses() {
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    creditPoints: "",
    semester: "",
    lecturerName: "",
    lecturerEmail: "",
    degreeProgram: "",
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const navigate = useNavigate();

  const generateRandomCode = () => {
    const generate = () => "CRS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    let newCode = generate();
    const saved = JSON.parse(localStorage.getItem("courses") || "[]");
    const codes = saved.map((c) => c.courseCode);

    while (codes.includes(newCode)) {
      newCode = generate();
    }
    return newCode;
  };

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }

    const randomCode = generateRandomCode();
    setFormData((prev) => ({ ...prev, courseCode: randomCode }));
  }, []);

  const validateField = (name, value) => {
    let msg = "";

    if (!value || value.trim() === "") {
      msg = "This field is required";
    } else {
      if (name === "lecturerEmail") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          msg = "Invalid email format";
        }
      }

      if (name === "creditPoints") {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) {
          msg = "Credit points must be greater than 0";
        }
      }

      if (name === "lecturerName") {
        const nameRegex = /^[A-Za-z\u0590-\u05FF\s]{2,}$/;
        if (!nameRegex.test(value.trim())) {
          msg = "Only Hebrew or English letters allowed (min 2 characters)";
        }
      }
    }

    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: msg });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg);
    if (hasError) {
      alert("Please fix all errors before saving.");
      return;
    }

    const updated = [...courses, { ...formData, enrolledStudents: [] }];
    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));
    setSummaryOpen(true); // show summary
  };

  const handleCloseSummary = () => {
    setSummaryOpen(false);
    navigate("/courses");
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
        Add New Course
      </Typography>

      <TextField
        label="Course Code"
        name="courseCode"
        value={formData.courseCode}
        InputProps={{ readOnly: true }}
      />

      <TextField
        label="Course Name *"
        name="courseName"
        value={formData.courseName}
        onChange={handleChange}
        error={!!errors.courseName}
        helperText={errors.courseName}
      />

      <TextField
        label="Credit Points *"
        name="creditPoints"
        type="number"
        value={formData.creditPoints}
        onChange={handleChange}
        error={!!errors.creditPoints}
        helperText={errors.creditPoints}
      />

      <TextField
        select
        label="Semester *"
        name="semester"
        value={formData.semester}
        onChange={handleChange}
        error={!!errors.semester}
        helperText={errors.semester}
      >
        {semesterOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Lecturer Name *"
        name="lecturerName"
        value={formData.lecturerName}
        onChange={handleChange}
        error={!!errors.lecturerName}
        helperText={errors.lecturerName}
      />

      <TextField
        label="Lecturer Email *"
        name="lecturerEmail"
        type="email"
        value={formData.lecturerEmail}
        onChange={handleChange}
        error={!!errors.lecturerEmail}
        helperText={errors.lecturerEmail}
      />

      <TextField
        select
        label="Degree Program *"
        name="degreeProgram"
        value={formData.degreeProgram}
        onChange={handleChange}
        error={!!errors.degreeProgram}
        helperText={errors.degreeProgram}
      >
        {degreePrograms.map((degree) => (
          <MenuItem key={degree} value={degree}>
            {degree}
          </MenuItem>
        ))}
      </TextField>

      <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        Save
      </Button>

      <Button variant="outlined" onClick={() => navigate("/courses")}>
        Cancel
      </Button>

      {/* Summary Dialog */}
      <Dialog open={summaryOpen} onClose={handleCloseSummary}>
        <DialogTitle>Course Summary</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography><strong>Course Code:</strong> {formData.courseCode}</Typography>
          <Typography><strong>Name:</strong> {formData.courseName}</Typography>
          <Typography><strong>Credits:</strong> {formData.creditPoints}</Typography>
          <Typography><strong>Semester:</strong> {formData.semester}</Typography>
          <Typography><strong>Lecturer:</strong> {formData.lecturerName}</Typography>
          <Typography><strong>Email:</strong> {formData.lecturerEmail}</Typography>
          <Typography><strong>Degree Program:</strong> {formData.degreeProgram}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSummary} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
