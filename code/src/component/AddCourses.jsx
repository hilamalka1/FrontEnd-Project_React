// AddCourses.jsx – עם אפשרות לעדכון ציונים לכל סטודנט בקורס
import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, Stack, Chip,
  Divider, FormControl, InputLabel, Select, OutlinedInput,
  Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Close } from "@mui/icons-material";
import { addCourse, updateCourse, listStudents } from "../firebase/Courses";

const semesterOptions = ["Semester A", "Semester B", "Summer"];
const degreePrograms = [
  "Computer Science", "Software Engineering", "Business Administration",
  "Biology", "Psychology", "Economics", "Education", "Architecture"
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
    enrolledStudents: [],
  });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]); // [{ studentId, grade }]
  const [errors, setErrors] = useState({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (name !== "enrolledStudents")
      setErrors((prev) => ({ ...prev, [name]: value ? "" : "Required" }));
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
        alert("Course updated successfully!");
      } else {
        await addCourse(courseToSave);
        alert("Course saved successfully!");
      }
      setSummaryOpen(true);
    } catch (err) {
      alert("Failed to save course");
      console.error(err);
    }
  };

  const handleCloseSummary = () => {
    setSummaryOpen(false);
    navigate("/courses");
  };

  return loading ? (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <LinearProgress sx={{ width: "80%" }} />
    </Box>
  ) : (
    <Box component="form" onSubmit={handleSave} sx={{ maxWidth: 600, mx: "auto", p: 4 }}>
      <Typography variant="h5" align="center" fontWeight="bold">
        {editingCourse ? "Edit Course" : "Add New Course"}
      </Typography>

      <TextField label="Course Name" name="courseName" value={formData.courseName} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
      <TextField label="Credit Points" name="creditPoints" type="number" value={formData.creditPoints} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
      <TextField select label="Semester" name="semester" value={formData.semester} onChange={handleChange} fullWidth sx={{ mt: 2 }}>
        {semesterOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
      <TextField label="Lecturer Name" name="lecturerName" value={formData.lecturerName} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
      <TextField label="Lecturer Email" name="lecturerEmail" type="email" value={formData.lecturerEmail} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
      <TextField select label="Degree Program" name="degreeProgram" value={formData.degreeProgram} onChange={handleChange} fullWidth sx={{ mt: 2 }}>
        {degreePrograms.map((deg) => <MenuItem key={deg} value={deg}>{deg}</MenuItem>)}
      </TextField>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Select Students</InputLabel>
        <Select
          multiple
          value={selectedStudents.map(s => s.studentId)}
          onChange={handleSelectStudents}
          input={<OutlinedInput label="Select Students" />}
          renderValue={(selected) => selected.map(id => {
            const s = students.find(stu => stu.studentId === id);
            return s ? `${s.firstName} ${s.lastName}` : id;
          }).join(", ")}
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
        <Box sx={{ mt: 3 }}>
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

      <Button variant="contained" type="submit" sx={{ mt: 4, bgcolor: "#81c784" }}>
        Save
      </Button>

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
