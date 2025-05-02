import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputLabel, FormControl, OutlinedInput,
  Checkbox, ListItemText, Chip, Stack, Divider
} from "@mui/material";
import { Add, PersonAdd, Edit, Delete, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    const savedStudents = localStorage.getItem("students");
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
  }, []);

  const handleAddStudentToCourse = () => {
    if (selectedCourseIndex !== null) {
      const updatedCourses = [...courses];
      const course = updatedCourses[selectedCourseIndex];
      course.enrolledStudents = course.enrolledStudents || [];

      selectedStudents.forEach((studentId) => {
        const student = students.find((s) => s.studentId === studentId);
        const alreadyEnrolled = course.enrolledStudents.find((s) => s.studentId === studentId);
        if (student && !alreadyEnrolled) {
          course.enrolledStudents.push(student);
        }
      });

      setCourses(updatedCourses);
      localStorage.setItem("courses", JSON.stringify(updatedCourses));
      setSelectedStudents([]);
      setSelectedCourseIndex(null);
    }
  };

  const handleEditCourse = (course) => {
    navigate("/add-course", { state: { course } });
  };

  const handleDeleteCourse = (index) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    const updatedCourses = [...courses];
    updatedCourses.splice(index, 1);
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
  };

  const handleRemoveStudentFromCourse = (courseIndex, studentId) => {
    if (!window.confirm("Remove this student?")) return;
    const updatedCourses = [...courses];
    updatedCourses[courseIndex].enrolledStudents =
      updatedCourses[courseIndex].enrolledStudents.filter((s) => s.studentId !== studentId);
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
  };

  const filtered = courses.filter((c) => selectedDegree ? c.degreeProgram === selectedDegree : true);
  const selectedCourse = selectedCourseIndex !== null ? courses[selectedCourseIndex] : null;
  const alreadyEnrolledIds = selectedCourse?.enrolledStudents?.map(s => s.studentId) || [];

  useEffect(() => {
    if (selectedCourseIndex !== null && selectedCourse) {
      setSelectedStudents(alreadyEnrolledIds);
    }
  }, [selectedCourseIndex]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3} align="center" fontWeight="bold">
        Course Management
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}
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
            {[...new Set(courses.map((c) => c.degreeProgram).filter(Boolean))].map((deg) => (
              <MenuItem key={deg} value={deg}>{deg}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>
              {['Code', 'Name', 'Credits', 'Semester', 'Lecturer', 'Degree', 'Students', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length ? filtered.map((course, index) => (
              <TableRow key={course.courseCode || index} hover>
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
                        <Chip
                          key={s.studentId}
                          label={`${s.firstName} ${s.lastName}`}
                          onDelete={() => handleRemoveStudentFromCourse(index, s.studentId)}
                          deleteIcon={<Close />}
                          sx={{ mb: 1, bgcolor: "#81c784" }}
                        />
                      ))}
                    </Stack>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => setSelectedCourseIndex(index)} title="Add Students">
                    <PersonAdd />
                  </IconButton>
                  <IconButton onClick={() => handleEditCourse(course)} title="Edit Course">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteCourse(index)} title="Delete Course" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={selectedCourseIndex !== null} onClose={() => setSelectedCourseIndex(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Students to Course</DialogTitle>
        <DialogContent>
          {selectedCourse?.enrolledStudents?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Already Enrolled:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {selectedCourse.enrolledStudents.map((s) => (
                  <Chip key={s.studentId} label={`${s.firstName} ${s.lastName}`} />
                ))}
              </Stack>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
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
                  <Checkbox checked={selectedStudents.includes(s.studentId)} />
                  <ListItemText primary={`${s.firstName} ${s.lastName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCourseIndex(null)}>Cancel</Button>
          <Button
            onClick={handleAddStudentToCourse}
            variant="contained"
            sx={{ bgcolor: "#81c784", '&:hover': { bgcolor: "#66bb6a" } }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
