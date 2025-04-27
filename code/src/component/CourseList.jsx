import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText
} from "@mui/material";
import { Add, PersonAdd, Edit } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    const savedStudents = localStorage.getItem("students");

    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  const handleAddStudentToCourse = () => {
    if (selectedCourseIndex !== null && selectedStudents.length > 0) {
      const updatedCourses = [...courses];
      const course = updatedCourses[selectedCourseIndex];

      selectedStudents.forEach((studentId) => {
        const student = students.find((s) => s.studentId === studentId);
        const alreadyEnrolled = course.enrolledStudents?.find((s) => s.studentId === studentId);

        if (student && !alreadyEnrolled) {
          if (!course.enrolledStudents) course.enrolledStudents = [];
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

  const filtered = courses.filter((course) => {
    const matchesSearch = [
      course.courseCode,
      course.courseName,
      course.lecturerName
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDegree = selectedDegree
      ? course.degreeProgram === selectedDegree
      : true;

    return matchesSearch && matchesDegree;
  });

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Course Management
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <Link to="/add-course">
          <Button variant="contained" startIcon={<Add />}>
            Add New Course
          </Button>
        </Link>
        <TextField
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Lecturer</TableCell>
              <TableCell>Degree</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((course, index) => (
              <TableRow key={course.courseCode || index}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>{course.creditPoints}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell>{course.lecturerName}</TableCell>
                <TableCell>{course.degreeProgram}</TableCell>
                <TableCell>
                  {course.enrolledStudents?.map((s) => `${s.firstName} ${s.lastName}`).join(", ") || "-"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => setSelectedCourseIndex(index)}>
                    <PersonAdd />
                  </IconButton>
                  <IconButton onClick={() => handleEditCourse(course)}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={selectedCourseIndex !== null} onClose={() => setSelectedCourseIndex(null)}>
        <DialogTitle>Add Students to Course</DialogTitle>
        <DialogContent>
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
                  <Checkbox checked={selectedStudents.indexOf(s.studentId) > -1} />
                  <ListItemText primary={`${s.firstName} ${s.lastName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCourseIndex(null)}>Cancel</Button>
          <Button onClick={handleAddStudentToCourse} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
