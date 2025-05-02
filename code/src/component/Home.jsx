import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from "@mui/material";
import {
  Person,
  Email,
  School,
  Assignment,
  CalendarToday,
  Event
} from "@mui/icons-material";

export default function Home() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("students")) || []);
    setCourses(JSON.parse(localStorage.getItem("courses")) || []);
    setAssignments(JSON.parse(localStorage.getItem("assignments")) || []);
    setExams(JSON.parse(localStorage.getItem("exams")) || []);
    setEvents(JSON.parse(localStorage.getItem("events")) || []);
  }, []);

  useEffect(() => {
    const student = students.find((s) => s.studentId === selectedStudentId);
    setSelectedStudent(student || null);
  }, [selectedStudentId, students]);

  const getStudentCourses = () =>
    courses.filter((c) =>
      c.enrolledStudents?.some((s) => s.studentId === selectedStudentId)
    );

  const getStudentAssignments = () =>
    assignments.filter((a) =>
      getStudentCourses().some((c) => c.courseCode === a.courseCode)
    );

  const getStudentExams = () =>
    exams.filter((e) =>
      getStudentCourses().some((c) => c.courseCode === e.courseCode)
    );

  const getStudentEvents = () =>
    events.filter((ev) => {
      if (ev.audienceType === "all") return true;
      if (ev.audienceType === "degree")
        return selectedStudent?.degreeProgram === ev.audienceValue;
      if (ev.audienceType === "course")
        return getStudentCourses().some((c) => c.courseCode === ev.audienceValue);
      if (ev.audienceType === "students")
        return ev.audienceValue.includes(selectedStudentId);
      return false;
    });

  return (
    <Box p={2} sx={{ bgcolor: "#f9fff9", minHeight: "100vh" }}>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Student</InputLabel>
        <Select
          value={selectedStudentId}
          label="Select Student"
          onChange={(e) => setSelectedStudentId(e.target.value)}
          sx={{ bgcolor: "#e8f5e9" }}
        >
          {students.map((student) => (
            <MenuItem key={student.studentId} value={student.studentId}>
              {student.firstName} {student.lastName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedStudent && (
        <>
          <Card sx={{ mb: 3, bgcolor: "#e8f5e9" }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Student Profile
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary={`${selectedStudent.firstName} ${selectedStudent.lastName}`} secondary="Full Name" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><School /></ListItemIcon>
                  <ListItemText primary={selectedStudent.studentId} secondary="Student ID" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText primary={selectedStudent.email} secondary="Email" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment /></ListItemIcon>
                  <ListItemText primary={`Year ${selectedStudent.academicYear}`} secondary="Academic Year" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><School /></ListItemIcon>
                  <ListItemText primary={selectedStudent.degreeProgram} secondary="Degree Program" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, bgcolor: "#e8f5e9" }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Current Semester Courses
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {getStudentCourses().map((c) => (
                  <ListItem key={c.courseCode} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                    <Box>
                      <Typography fontWeight="bold">{c.courseName}</Typography>
                      <Typography variant="body2" color="text.secondary">{c.lecturerName}</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Email />}
                      onClick={() => window.location.href = `mailto:${c.lecturerEmail}`}
                      sx={{ mt: { xs: 1, sm: 0 } }}
                    >
                      Contact Lecturer
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
            <Card sx={{ flex: 1, bgcolor: "#e8f5e9" }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Upcoming Events
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {getStudentEvents().map((ev) => (
                    <ListItem key={ev.id}>
                      <ListItemIcon><Event /></ListItemIcon>
                      <ListItemText primary={ev.eventName} secondary={ev.eventDate} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, bgcolor: "#e8f5e9" }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Assignments & Exams
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {getStudentAssignments().map((a) => (
                    <ListItem key={a.id}>
                      <ListItemIcon><Assignment /></ListItemIcon>
                      <ListItemText primary={a.assignmentName} secondary={a.dueDate} />
                    </ListItem>
                  ))}
                  {getStudentExams().map((e) => (
                    <ListItem key={e.id}>
                      <ListItemIcon><CalendarToday /></ListItemIcon>
                      <ListItemText primary={e.examName} secondary={e.examDate} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
}
