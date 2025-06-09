// CourseList.jsx – גרסה עם אפשרות עדכון ציונים ישירות מהטבלה
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputLabel, FormControl, OutlinedInput,
  Checkbox, ListItemText, Chip, Stack, Tooltip, CircularProgress, TextField
} from "@mui/material";
import { Add, PersonAdd, Edit, Delete, RemoveCircle, Grade } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  listStudents,
  deleteCourseByCode,
  getCourseByCode,
  updateCourse
} from "../firebase/Courses";
import { getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [gradeDialog, setGradeDialog] = useState({ open: false, student: null, course: null });
  const [newGrade, setNewGrade] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseSnap = await getDocs(collection(firestore, "courses"));
        const coursesData = courseSnap.docs.map((doc) => doc.data());
        const studentsData = await listStudents();
        setCourses(coursesData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStudentName = (id) => {
    const s = students.find((stu) => stu.studentId === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  const handleEditCourse = (course) => navigate("/add-course", { state: { course } });

  const handleDeleteCourse = async (courseCode) => {
    if (!window.confirm("Delete this course?")) return;
    setActionLoading(courseCode);
    try {
      await deleteCourseByCode(courseCode);
      setCourses((prev) => prev.filter((c) => c.courseCode !== courseCode));
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveStudentDirectly = async (course, studentId) => {
    const updatedEnrolled = course.enrolledStudents.filter((s) => s.studentId !== studentId);
    const updatedCourse = { ...course, enrolledStudents: updatedEnrolled };
    await updateCourse(updatedCourse);
    setCourses((prev) =>
      prev.map((c) => (c.courseCode === updatedCourse.courseCode ? updatedCourse : c))
    );
  };

  const handleUpdateGrade = async () => {
    const parsed = parseInt(newGrade);
    const updatedCourse = { ...gradeDialog.course };
    updatedCourse.enrolledStudents = updatedCourse.enrolledStudents.map((s) =>
      s.studentId === gradeDialog.student.studentId
        ? { ...s, grade: parsed, completed: parsed >= 60 }
        : s
    );
    await updateCourse(updatedCourse);
    setCourses((prev) =>
      prev.map((c) => (c.courseCode === updatedCourse.courseCode ? updatedCourse : c))
    );
    setGradeDialog({ open: false, student: null, course: null });
    setNewGrade("");
  };

  const tableHeaders = ["Code", "Name", "Credits", "Semester", "Lecturer", "Degree", "Students", "Actions"];

  const filtered = courses.filter((c) =>
    selectedDegree ? c.degreeProgram === selectedDegree : true
  );

  const uniqueDegrees = [...new Set(courses.map((c) => c.degreeProgram).filter(Boolean))];

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" gap={2}>
        <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" color="textSecondary">Loading courses...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3} align="center" fontWeight="bold">Course Management</Typography>

      <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center" mb={3}>
        <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: "#81c784", "&:hover": { bgcolor: "#66bb6a" } }} onClick={() => navigate("/add-course")}>Add New Course</Button>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Degree</InputLabel>
          <Select value={selectedDegree} label="Filter by Degree" onChange={(e) => setSelectedDegree(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {uniqueDegrees.map((deg) => <MenuItem key={deg} value={deg}>{deg}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>{tableHeaders.map((h) => <TableCell key={h} sx={{ fontWeight: "bold" }}>{h}</TableCell>)}</TableRow>
          </TableHead>
          <TableBody>
            {filtered.length ? (
              filtered.map((course) => (
                <TableRow key={course.courseCode} hover>
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.creditPoints}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.lecturerName}</TableCell>
                  <TableCell>{course.degreeProgram}</TableCell>
                  <TableCell>
                    {course.enrolledStudents?.length ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {course.enrolledStudents.map((s) => (
                          <Tooltip key={s.studentId} title={`Grade: ${s.grade || 0} | ${s.completed ? "✔ Completed" : "In Progress"}`}>
                            <Chip
                              label={`${s.firstName} ${s.lastName}`}
                              onClick={() => setGradeDialog({ open: true, student: s, course })}
                              onDelete={() => handleRemoveStudentDirectly(course, s.studentId)}
                              deleteIcon={<RemoveCircle />}
                              icon={<Grade />}
                              sx={{ mb: 1, bgcolor: s.completed ? "#388e3c" : "#81c784", color: s.completed ? "#fff" : "#000" }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditCourse(course)} title="Edit Course"><Edit /></IconButton>
                    <IconButton onClick={() => handleDeleteCourse(course.courseCode)} title="Delete Course" color="error" disabled={actionLoading === course.courseCode}>
                      {actionLoading === course.courseCode ? <CircularProgress size={20} thickness={5} /> : <Delete />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={8} align="center">No courses found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={gradeDialog.open} onClose={() => setGradeDialog({ open: false, student: null, course: null })}>
        <DialogTitle>Update Grade</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Grade"
            type="number"
            fullWidth
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
            inputProps={{ min: 0, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialog({ open: false, student: null, course: null })}>Cancel</Button>
          <Button onClick={handleUpdateGrade} variant="contained" sx={{ bgcolor: "#81c784" }}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
