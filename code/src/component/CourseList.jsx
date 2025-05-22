import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputLabel, FormControl, OutlinedInput,
  Checkbox, ListItemText, Chip, Stack, Divider, Tooltip
} from "@mui/material";
import { Add, PersonAdd, Edit, Delete, Close, RemoveCircle } from "@mui/icons-material";
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
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const courseSnap = await getDocs(collection(firestore, "courses"));
      const coursesData = courseSnap.docs.map((doc) => doc.data());
      const studentsData = await listStudents();
      setCourses(coursesData);
      setStudents(studentsData);
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
    await deleteCourseByCode(courseCode);
    setCourses((prev) => prev.filter((c) => c.courseCode !== courseCode));
  };

  const handleRemoveStudentFromCourse = (studentId) => {
    setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
  };

  const handleRemoveStudentDirectly = async (course, studentId) => {
    const updatedEnrolled = course.enrolledStudents.filter((s) => s.studentId !== studentId);
    const updatedCourse = { ...course, enrolledStudents: updatedEnrolled };
    await updateCourse(updatedCourse);
    setCourses((prev) =>
      prev.map((c) => (c.courseCode === updatedCourse.courseCode ? updatedCourse : c))
    );
  };

  const handleAddStudentToCourse = async () => {
    const updatedEnrolled = students.filter((s) => selectedStudents.includes(s.studentId));
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
    const studentIds = course.enrolledStudents?.map((s) => s.studentId) || [];
    setSelectedStudents(studentIds);
    setOriginalStudents(studentIds);
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
                          <Tooltip title="Remove Student" key={s.studentId}>
                            <Chip
                              label={`${s.firstName} ${s.lastName}`}
                              onDelete={() => handleRemoveStudentDirectly(course, s.studentId)}
                              deleteIcon={<RemoveCircle />}
                              sx={{ mb: 1, bgcolor: "#81c784" }}
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
                    <IconButton onClick={() => handleDeleteCourse(course.courseCode)} title="Delete Course" color="error">
                      <Delete />
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
          {selectedStudents.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Already Enrolled:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {selectedStudents.map((id) => {
                  const s = students.find((stu) => stu.studentId === id);
                  return (
                    s && (
                      <Chip
                        key={id}
                        label={`${s.firstName} ${s.lastName}`}
                        onDelete={() => handleRemoveStudentFromCourse(id)}
                        deleteIcon={<Close />}
                        sx={{ mb: 1, bgcolor: "#81c784" }}
                      />
                    )
                  );
                })}
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
              renderValue={(selected) => selected.map(getStudentName).join(", ")}
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
          <Button onClick={handleCancelDialog}>Cancel</Button>
          <Button
            onClick={handleAddStudentToCourse}
            variant="contained"
            sx={{ bgcolor: "#81c784", "&:hover": { bgcolor: "#66bb6a" } }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}