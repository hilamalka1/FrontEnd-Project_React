// AddCourses.jsx – כולל עיצוב אחיד + ולידציה חיה מלאה + רספונסיביות

import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, Stack,
  FormControl, InputLabel, Select, OutlinedInput,
  Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, useMediaQuery
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { addCourse, updateCourse, listStudents } from "../firebase/Courses";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useTheme } from "@mui/material/styles";

const semesterOptions = ["Semester A", "Semester B", "Summer"];
const degreePrograms = [
  "Computer Science", "Software Engineering", "Business Administration",
  "Biology", "Psychology", "Economics", "Education", "Architecture"
];

const validateCourseName = (name) => name.trim().length >= 2;
const validateLecturerName = (name) => /^[\u0590-\u05FFa-zA-Z\s]+$/.test(name) && name.trim().length >= 3;
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function AddCourses() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    creditPoints: "",
    semester: "",
    lecturerName: "",
    lecturerEmail: "",
    degreeProgram: "",
    enrolledStudents: [],
  });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const editingCourse = location.state?.course || null;

  useEffect(() => {
    async function loadData() {
      const studentsData = await listStudents();
      setStudents(studentsData);

      if (editingCourse) {
        setFormData({ ...editingCourse });
        setSelectedStudents(
          editingCourse.enrolledStudents?.map(s => ({
            studentId: s.studentId,
            grade: s.grade || 0
          })) || []
        );
      } else {
        const generateCode = () =>
          "CRS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData((prev) => ({ ...prev, courseCode: generateCode() }));
      }
      setLoading(false);
    }
    loadData();
  }, [editingCourse]);

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  setGeneralError("");

  const newErrors = { ...errors };

  if (name === "courseName" && !validateCourseName(value)) {
    newErrors.courseName = "Course name must be at least 2 characters";
  } else if (name === "creditPoints" && !value) {
    newErrors.creditPoints = "Credit points are required";
  } else if (name === "semester" && !value) {
    newErrors.semester = "Semester is required";
  } else if (name === "lecturerName" && !validateLecturerName(value)) {
    newErrors.lecturerName = "Name must be Hebrew or English letters only and at least 3 characters";
  } else if (name === "lecturerEmail" && !validateEmail(value)) {
    newErrors.lecturerEmail = "Invalid email format";
  } else if (name === "degreeProgram" && !value) {
    newErrors.degreeProgram = "Degree program is required";
  } else {
    delete newErrors[name];
  }

  setErrors(newErrors);
};

const handleSelectStudents = (e) => {
  const selectedIds = e.target.value;
  setSelectedStudents(prev => {
    const existing = prev.filter(s => selectedIds.includes(s.studentId));
    const added = selectedIds.filter(id => !existing.some(s => s.studentId === id))
      .map(id => ({ studentId: id, grade: 0 }));
    return [...existing, ...added];
  });
};

const handleGradeChange = (studentId, grade) => {
  const parsed = parseInt(grade);
  setSelectedStudents(prev =>
    prev.map(s => s.studentId === studentId ? { ...s, grade: parsed } : s)
  );
};

const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);
  setGeneralError("");
  const newErrors = {};

  if (!validateCourseName(formData.courseName)) newErrors.courseName = "Course name must be at least 2 characters";
  if (!formData.creditPoints) newErrors.creditPoints = "Credit points are required";
  if (!formData.semester) newErrors.semester = "Semester is required";
  if (!validateLecturerName(formData.lecturerName)) newErrors.lecturerName = "Name must be Hebrew or English letters only and at least 3 characters";
  if (!validateEmail(formData.lecturerEmail)) newErrors.lecturerEmail = "Invalid email format";
  if (!formData.degreeProgram) newErrors.degreeProgram = "Degree program is required";

  const q = query(collection(firestore, "courses"), where("lecturerEmail", "==", formData.lecturerEmail));
  const snapshot = await getDocs(q);
  const emailExists = snapshot.docs.some(doc => {
    if (editingCourse) return doc.id !== editingCourse.id;
    return true;
  });
  if (emailExists) newErrors.lecturerEmail = "Email must be unique";

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) {
    setGeneralError("Please fix the errors before saving.");
    setSaving(false);
    return;
  }

  const enrolled = students
    .filter(s => selectedStudents.some(sel => sel.studentId === s.studentId))
    .map(s => {
      const match = selectedStudents.find(sel => sel.studentId === s.studentId);
      return {
        studentId: s.studentId,
        firstName: s.firstName,
        lastName: s.lastName,
        grade: match?.grade || 0,
        completed: (match?.grade || 0) >= 60
      };
    });

  const courseToSave = { ...formData, enrolledStudents: enrolled };

  try {
    if (editingCourse) {
      await updateCourse(courseToSave);
    } else {
      await addCourse(courseToSave);
    }
    setSummaryOpen(true);
  } catch (err) {
    setGeneralError("Failed to save course");
    console.error(err);
  } finally {
    setSaving(false);
  }
};

const handleCancel = () => navigate("/courses");
const handleCloseSummary = () => { setSummaryOpen(false); navigate("/courses"); };

return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        {editingCourse ? "Edit Course" : "Add New Course"}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSave}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: isMobile ? "100%" : 600,
          mx: "auto",
          p: 2,
          gap: 2,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff"
        }}
      >
        {generalError && <Alert severity="error">{generalError}</Alert>}

        <TextField fullWidth label="Course Name" name="courseName" value={formData.courseName} onChange={handleChange} error={!!errors.courseName} helperText={errors.courseName} />
        <TextField fullWidth label="Credit Points" name="creditPoints" type="number" value={formData.creditPoints} onChange={handleChange} error={!!errors.creditPoints} helperText={errors.creditPoints} />
        <TextField fullWidth select label="Semester" name="semester" value={formData.semester} onChange={handleChange} error={!!errors.semester} helperText={errors.semester}>
          {semesterOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField fullWidth label="Lecturer Name" name="lecturerName" value={formData.lecturerName} onChange={handleChange} error={!!errors.lecturerName} helperText={errors.lecturerName} />
        <TextField fullWidth label="Lecturer Email" name="lecturerEmail" type="email" value={formData.lecturerEmail} onChange={handleChange} error={!!errors.lecturerEmail} helperText={errors.lecturerEmail} />
        <TextField fullWidth select label="Degree Program" name="degreeProgram" value={formData.degreeProgram} onChange={handleChange} error={!!errors.degreeProgram} helperText={errors.degreeProgram}>
          {degreePrograms.map((deg) => (
            <MenuItem key={deg} value={deg}>{deg}</MenuItem>
          ))}
        </TextField>

        <FormControl fullWidth>
          <InputLabel>Select Students</InputLabel>
          <Select
            multiple
            value={selectedStudents.map(s => s.studentId)}
            onChange={handleSelectStudents}
            input={<OutlinedInput label="Select Students" />}
            renderValue={(selected) =>
              selected.map(id => {
                const s = students.find(stu => stu.studentId === id);
                return s ? `${s.firstName} ${s.lastName}` : id;
              }).join(", ")
            }
          >
            {students.map((s) => (
              <MenuItem key={s.studentId} value={s.studentId}>
                <Checkbox checked={selectedStudents.some(sel => sel.studentId === s.studentId)} />
                <ListItemText primary={`${s.firstName} ${s.lastName}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedStudents.length > 0 && (
          <Box>
            <Typography fontWeight="bold">Enter Grades</Typography>
            <Stack spacing={1} mt={1}>
              {selectedStudents.map(({ studentId, grade }) => {
                const s = students.find(stu => stu.studentId === studentId);
                return s ? (
                  <Box key={studentId} display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ minWidth: 150 }}>{s.firstName} {s.lastName}</Typography>
                    <TextField
                      type="number"
                      label="Grade"
                      value={grade}
                      onChange={(e) => handleGradeChange(studentId, e.target.value)}
                      sx={{ width: 100 }}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Box>
                ) : null;
              })}
            </Stack>
          </Box>
        )}

        <Stack direction="row" spacing={2} mt={2} justifyContent="center">
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ minWidth: 140, bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}
          >
            {saving ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Save"}
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

      <Dialog open={summaryOpen} onClose={handleCloseSummary} fullWidth>
        <DialogTitle>Course Saved</DialogTitle>
        <DialogContent>
          <Typography>Course was successfully saved or updated.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSummary}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}