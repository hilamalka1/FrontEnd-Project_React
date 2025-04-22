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
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import { Link } from "react-router-dom";

// ✅ Updated course list matching student course names
const defaultCourses = [
  {
    courseCode: "CS101",
    courseName: "Computer Science",
    creditPoints: 4,
    semester: "A",
    lecturerName: "Dr. Alan Turing",
    lecturerEmail: "turing@example.com",
  },
  {
    courseCode: "SE201",
    courseName: "Software Engineering",
    creditPoints: 3,
    semester: "B",
    lecturerName: "Dr. Margaret Hamilton",
    lecturerEmail: "margaret@example.com",
  },
  {
    courseCode: "BIO105",
    courseName: "Biology",
    creditPoints: 3,
    semester: "A",
    lecturerName: "Dr. Jane Goodall",
    lecturerEmail: "jane@example.com",
  },
  {
    courseCode: "CHEM110",
    courseName: "Chemistry",
    creditPoints: 3,
    semester: "A",
    lecturerName: "Dr. Marie Curie",
    lecturerEmail: "curie@example.com",
  },
  {
    courseCode: "ECON120",
    courseName: "Economics",
    creditPoints: 3,
    semester: "B",
    lecturerName: "Prof. Adam Smith",
    lecturerEmail: "adam@example.com",
  },
  {
    courseCode: "PSY150",
    courseName: "Psychology",
    creditPoints: 2,
    semester: "B",
    lecturerName: "Dr. Sigmund Freud",
    lecturerEmail: "freud@example.com",
  },
];

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("courses");
    if (saved) {
      setCourses(JSON.parse(saved));
    } else {
      localStorage.setItem("courses", JSON.stringify(defaultCourses));
      setCourses(defaultCourses);
    }
  }, []);

  const filtered = courses.filter((course) =>
    [course.courseCode, course.courseName, course.lecturerName]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditData({ ...courses[index] });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    const updated = [...courses];
    updated[editIndex] = editData;
    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setEditIndex(null);
    setEditData({});
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Course List
      </Typography>

      {/* Search + Add button in center (button left, search right) */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <Link to="/Add-course" style={{ textDecoration: "none" }}>
          <Button variant="contained" startIcon={<Add />}>
            Add Course
          </Button>
        </Link>
        <TextField
          placeholder="Search by course name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "100%", maxWidth: 400 }}
        />
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
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((course, index) => (
              <TableRow key={index}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>{course.creditPoints}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell>{course.lecturerName}</TableCell>
                <TableCell>{course.lecturerEmail}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(index)}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editIndex !== null} onClose={handleCloseDialog}>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Course Code"
            name="courseCode"
            value={editData.courseCode || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Course Name"
            name="courseName"
            value={editData.courseName || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Credits"
            name="creditPoints"
            value={editData.creditPoints || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Semester"
            name="semester"
            value={editData.semester || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Lecturer Name"
            name="lecturerName"
            value={editData.lecturerName || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Lecturer Email"
            name="lecturerEmail"
            value={editData.lecturerEmail || ""}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
