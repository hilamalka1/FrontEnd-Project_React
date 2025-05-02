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
  DialogActions,
  Stack,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Close } from "@mui/icons-material";

const semesterOptions = ["Semester A", "Semester B", "Summer"];
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
    enrolledStudents: []
  });

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editingCourse = location.state?.course || null;

  useEffect(() => {
    const savedStudents = JSON.parse(localStorage.getItem("students") || "[]");
    setStudents(savedStudents);

    if (editingCourse) {
      setFormData(editingCourse);
      setSelectedStudents(editingCourse.enrolledStudents?.map(s => s.studentId) || []);
    } else {
      const generateCode = () => "CRS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const saved = JSON.parse(localStorage.getItem("courses") || "[]");
      let newCode = generateCode();
      while (saved.some(c => c.courseCode === newCode)) {
        newCode = generateCode();
      }
      setFormData(prev => ({ ...prev, courseCode: newCode }));
    }
  }, [editingCourse]);

  const validateField = (name, value) => {
    let msg = "";

    if (!value || value.toString().trim() === "") {
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
        const nameRegex = /^[A-Za-z֐-׿\s]{2,}$/;
        if (!nameRegex.test(value.trim())) {
          msg = "Only Hebrew or English letters allowed (min 2 characters)";
        }
      }

      if (name === "semester" && !semesterOptions.includes(value)) {
        msg = "Please select a valid semester";
      }

      if (name === "degreeProgram" && !degreePrograms.includes(value)) {
        msg = "Please select a valid degree program";
      }
    }

    if (name === "enrolledStudents" && Array.isArray(value)) {
      return "";
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
      const msg = validateField(key, formData[key]);
      newErrors[key] = msg;
    });

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg);
    if (hasError) {
      alert("Please fix all errors before saving.");
      return;
    }

    const enrolled = students.filter(s => selectedStudents.includes(s.studentId));
    const courseToSave = { ...formData, enrolledStudents: enrolled };
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]");
    let updated;
    if (editingCourse) {
      updated = savedCourses.map((c) =>
        c.courseCode === editingCourse.courseCode ? courseToSave : c
      );
    } else {
      updated = [...savedCourses, courseToSave];
    }

    localStorage.setItem("courses", JSON.stringify(updated));
    setSummaryOpen(true);
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
        width: "90%",
        mx: "auto",
        p: 4,
        gap: 2,
        bgcolor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: 3
      }}
    >
      <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
        {editingCourse ? "Edit Course" : "Add New Course"}
      </Typography>

      <TextField label="Course Code" name="courseCode" value={formData.courseCode} InputProps={{ readOnly: true }} fullWidth />
      <TextField label="Course Name *" name="courseName" value={formData.courseName} onChange={handleChange} error={!!errors.courseName} helperText={errors.courseName} fullWidth />
      <TextField label="Credit Points *" name="creditPoints" type="number" value={formData.creditPoints} onChange={handleChange} error={!!errors.creditPoints} helperText={errors.creditPoints} fullWidth />

      <TextField select label="Semester *" name="semester" value={formData.semester} onChange={handleChange} error={!!errors.semester} helperText={errors.semester} fullWidth>
        {semesterOptions.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>

      <TextField label="Lecturer Name *" name="lecturerName" value={formData.lecturerName} onChange={handleChange} error={!!errors.lecturerName} helperText={errors.lecturerName} fullWidth />
      <TextField label="Lecturer Email *" name="lecturerEmail" type="email" value={formData.lecturerEmail} onChange={handleChange} error={!!errors.lecturerEmail} helperText={errors.lecturerEmail} fullWidth />

      <TextField select label="Degree Program *" name="degreeProgram" value={formData.degreeProgram} onChange={handleChange} error={!!errors.degreeProgram} helperText={errors.degreeProgram} fullWidth>
        {degreePrograms.map((degree) => (
          <MenuItem key={degree} value={degree}>{degree}</MenuItem>
        ))}
      </TextField>

      <FormControl fullWidth>
        <InputLabel>Select Students</InputLabel>
        <Select
          multiple
          value={selectedStudents}
          onChange={(e) => setSelectedStudents(e.target.value)}
          input={<OutlinedInput label="Select Students" />}
          renderValue={(selected) =>
            selected.map((id) => {
              const s = students.find((stu) => stu.studentId === id);
              return s ? `${s.firstName} ${s.lastName}` : id;
            }).join(", ")
          }
        >
          {students.map((s) => (
            <MenuItem key={s.studentId} value={s.studentId}>
              <Checkbox checked={selectedStudents.indexOf(s.studentId) > -1} />
              <ListItemText primary={`${s.firstName} ${s.lastName}`} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedStudents.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">Enrolled Students</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
            {selectedStudents.map((id) => {
              const s = students.find((stu) => stu.studentId === id);
              return s ? (
                <Chip
                  key={id}
                  label={`${s.firstName} ${s.lastName}`}
                  onDelete={() => setSelectedStudents(prev => prev.filter(pid => pid !== id))}
                  deleteIcon={<Close sx={{ color: '#66bb6a' }} />}
                  sx={{ mb: 1, bgcolor: '#81c784' }}
                />
              ) : null;
            })}
          </Stack>
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}

      <Button variant="contained" type="submit" sx={{ mt: 2, bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}>Save</Button>
      <Button variant="outlined" onClick={() => navigate("/courses")} sx={{ borderColor: "#81c784", color: "#388e3c" }}>Cancel</Button>

      <Dialog open={summaryOpen} onClose={handleCloseSummary} fullWidth>
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
          <Button onClick={handleCloseSummary} autoFocus sx={{ color: "#388e3c" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
