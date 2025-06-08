// CourseList.jsx – גרסה עם טעינה מקצועית ואינדיקציית פעולה
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputLabel, FormControl, OutlinedInput,
  Checkbox, ListItemText, Chip, Stack, Tooltip, TextField, CircularProgress
} from "@mui/material";
import { Add, PersonAdd, Edit, Delete, RemoveCircle } from "@mui/icons-material";
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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // מזהה של קורס בפעולה
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

  const handleRemoveStudentFromCourse = (studentId) => {
    setSelectedStudents((prev) => prev.filter((s) => s.studentId !== studentId));
  };

  const handleRemoveStudentDirectly = async (course, studentId) => {
    const updatedEnrolled = course.enrolledStudents.filter((s) => s.studentId !== studentId);
    const updatedCourse = { ...course, enrolledStudents: updatedEnrolled };
    await updateCourse(updatedCourse);
    setCourses((prev) =>
      prev.map((c) => (c.courseCode === updatedCourse.courseCode ? updatedCourse : c))
    );
  };

  const toggleGrade = (studentId, grade) => {
    const parsed = parseInt(grade);
    setSelectedStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, grade: parsed, completed: parsed >= 60 }
          : s
      )
    );
  };

  const handleAddStudentToCourse = async () => {
    const updatedEnrolled = students
      .filter((s) => selectedStudents.some((sel) => sel.studentId === s.studentId))
      .map((s) => {
        const match = selectedStudents.find((sel) => sel.studentId === s.studentId);
        return {
          studentId: s.studentId,
          firstName: s.firstName,
          lastName: s.lastName,
          grade: match?.grade || 0,
          completed: match?.grade >= 60,
        };
      });

    const updatedCourse = {
      ...selectedCourse,
      enrolledStudents: updatedEnrolled,
    };

    await updateCourse(updatedCourse);
    const updatedCourses = courses.map((c) =>
      c.courseCode === updatedCourse.courseCode ? updatedCourse : c
    );
    setCourses(updatedCourses);
    handleCloseDialog();
  };

  const handleOpenDialog = async (courseCode) => {
    const course = await getCourseByCode(courseCode);
    setSelectedCourse(course);
    const studentObjects = course.enrolledStudents?.map((s) => ({
      studentId: s.studentId,
      grade: s.grade || 0,
    })) || [];
    setSelectedStudents(studentObjects);
    setOriginalStudents(studentObjects);
  };

  const handleCloseDialog = () => {
    setSelectedCourse(null);
    setSelectedStudents([]);
    setOriginalStudents([]);
  };

  const handleCancelDialog = () => {
    setSelectedStudents(originalStudents);
    handleCloseDialog();
  };

  const tableHeaders = ["Code", "Name", "Credits", "Semester", "Lecturer", "Degree", "Students", "Actions"];

  const filtered = courses.filter((c) =>
    selectedDegree ? c.degreeProgram === selectedDegree : true
  );

  const uniqueDegrees = [...new Set(courses.map((c) => c.degreeProgram).filter(Boolean))];

  if (loading) {
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
          Loading courses...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3} align="center" fontWeight="bold">
        Course Management
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: "#81c784", "&:hover": { bgcolor: "#66bb6a" } }}
          onClick={() => navigate("/add-course")}
        >
          Add New Course
        </Button>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Degree</InputLabel>
          <Select
            value={selectedDegree}
            label="Filter by Degree"
            onChange={(e) => setSelectedDegree(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {uniqueDegrees.map((deg) => (
              <MenuItem key={deg} value={deg}>{deg}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>
              {tableHeaders.map((h) => (
                <TableCell key={h} sx={{ fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
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
                          <Tooltip
                            key={s.studentId}
                            title={`Grade: ${s.grade || 0} | ${s.completed ? "✔ Completed" : "In Progress"}`}
                          >
                            <Chip
                              label={`${s.firstName} ${s.lastName}`}
                              onDelete={() => handleRemoveStudentDirectly(course, s.studentId)}
                              deleteIcon={<RemoveCircle />}
                              sx={{
                                mb: 1,
                                bgcolor: s.completed ? "#388e3c" : "#81c784",
                                color: s.completed ? "#fff" : "#000",
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(course.courseCode)} title="Add Students">
                      <PersonAdd />
                    </IconButton>
                    <IconButton onClick={() => handleEditCourse(course)} title="Edit Course">
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteCourse(course.courseCode)}
                      title="Delete Course"
                      color="error"
                      disabled={actionLoading === course.courseCode}
                    >
                      {actionLoading === course.courseCode ? (
                        <CircularProgress size={20} thickness={5} />
                      ) : (
                        <Delete />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedCourse} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Students to Course</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Students</InputLabel>
            <Select
              multiple
              value={selectedStudents.map((s) => s.studentId)}
              onChange={(e) => {
                const selectedIds = e.target.value;
                setSelectedStudents((prev) => {
                  const existing = prev.filter((s) => selectedIds.includes(s.studentId));
                  const added = selectedIds
                    .filter((id) => !existing.some((s) => s.studentId === id))
                    .map((id) => ({ studentId: id, grade: 0 }));
                  return [...existing, ...added];
                });
              }}
              input={<OutlinedInput label="Select Students" />}
              renderValue={(selected) =>
                selected.map(getStudentName).join(", ")
              }
            >
              {students.map((s) => {
                const selected = selectedStudents.find((sel) => sel.studentId === s.studentId);
                return (
                  <MenuItem key={s.studentId} value={s.studentId}>
                    <Checkbox checked={!!selected} />
                    <ListItemText
                      primary={`${s.firstName} ${s.lastName}`}
                      secondary={selected ? (
                        <TextField
                          type="number"
                          label="Grade"
                          value={selected.grade || ""}
                          onChange={(e) => toggleGrade(s.studentId, e.target.value)}
                          inputProps={{ min: 0, max: 100 }}
                          size="small"
                          sx={{ width: 100, mt: 1 }}
                        />
                      ) : null}
                    />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog}>Cancel</Button>
          <Button
            onClick={handleAddStudentToCourse}
            variant="contained"
            sx={{ bgcolor: "#81c784", "&:hover": { bgcolor: "#66bb6a" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
