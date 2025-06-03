// Home.jsx – גרסה סופית עם שמות קורסים בכל מקום במקום קוד
import React, { useEffect, useState } from "react";
import {
  Box, Typography, MenuItem, Select, FormControl, InputLabel, Card,
  List, ListItem, ListItemIcon, ListItemText, Divider, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Avatar
} from "@mui/material";
import { School, Email, EmojiObjects } from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Home() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openMailDialog, setOpenMailDialog] = useState(false);
  const [mailRecipient, setMailRecipient] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Semester A");

  const semesterOptions = ["Semester A", "Semester B", "Summer", "All Year"];

  const toDateString = (timestamp) =>
    timestamp?.toDate?.().toISOString().split("T")[0] ?? timestamp;

  useEffect(() => {
    const fetchData = async () => {
      const sSnap = await getDocs(collection(firestore, "students"));
      const cSnap = await getDocs(collection(firestore, "courses"));
      const aSnap = await getDocs(collection(firestore, "assignments"));
      const eSnap = await getDocs(collection(firestore, "exams"));
      const evSnap = await getDocs(collection(firestore, "events"));

      setStudents(sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCourses(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAssignments(aSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setExams(eSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEvents(evSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const student = students.find((s) => s.studentId === selectedStudentId);
    setSelectedStudent(student || null);
  }, [selectedStudentId, students]);

  const getStudentCourses = () =>
    courses.filter((c) =>
      c.enrolledStudents?.some((s) => s.studentId === selectedStudentId) &&
      (selectedSemester === "All Year" || c.semester === selectedSemester)
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

  const getStudentExams = () =>
    exams.filter((e) =>
      getStudentCourses().some((c) => c.courseCode === e.courseCode)
    );

  const getStudentAssignments = () =>
    assignments.filter((a) =>
      getStudentCourses().some((c) => c.courseCode === a.courseCode)
    );

  const calendarEvents = [
    ...getStudentEvents().map(ev => ({
      id: `event-${ev.id}`,
      title: ev.eventName,
      date: toDateString(ev.eventDate),
      backgroundColor: "#2196f3",
      extendedProps: ev
    })),
    ...getStudentExams().map(ex => ({
      id: `exam-${ex.id}`,
      title: ex.examName,
      date: toDateString(ex.examDate),
      backgroundColor: "#f44336",
      extendedProps: ex
    })),
    ...getStudentAssignments().map(a => ({
      id: `assignment-${a.id}`,
      title: a.assignmentTitle,
      date: toDateString(a.dueDate),
      backgroundColor: "#64b5f6",
      extendedProps: a
    }))
  ];

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const handleOpenMailDialog = (email) => {
    setMailRecipient(email);
    setOpenMailDialog(true);
  };

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
          <Card sx={{ mb: 3, p: 3, bgcolor: "#c8e6c9", display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ bgcolor: "#66bb6a", width: 56, height: 56 }}>
              <EmojiObjects fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Welcome back, {selectedStudent.firstName}!
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, fontStyle: "italic" }}>
                "Your dreams don't work unless you do."
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                🎓 Year: {selectedStudent.academicYear} &nbsp;&nbsp;📘 Program: {selectedStudent.degreeProgram}
              </Typography>
            </Box>
          </Card>

          <FormControl size="small" sx={{ mb: 2, borderRadius: 2, width: 250 }}>
            <InputLabel>Select Semester</InputLabel>
            <Select
              value={selectedSemester}
              label="Select Semester"
              onChange={(e) => setSelectedSemester(e.target.value)}
              sx={{ bgcolor: "#e8f5e9", borderRadius: 2 }}
            >
              {semesterOptions.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <List sx={{ bgcolor: "#e8f5e9", borderRadius: 2 }}>
            {getStudentCourses().map((course) => (
              <React.Fragment key={course.id}>
                <ListItem
                  secondaryAction={
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Email />}
                      onClick={() => handleOpenMailDialog(course.lecturerEmail)}
                    >
                      Message Lecturer
                    </Button>
                  }
                >
                  <ListItemIcon><School /></ListItemIcon>
                  <ListItemText
                    primary={course.courseName}
                    secondary={`Semester: ${course.semester} | Lecturer: ${course.lecturerName}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Box mt={4}>
            <Typography variant="h4" sx={{ textDecoration: "underline", mb: 1 }}>
              🧪 Exams
            </Typography>
            {getStudentExams().map((ex) => {
              const course = getStudentCourses().find((c) => c.courseCode === ex.courseCode);
              const courseName = course ? course.courseName : ex.courseCode;
              return (
                <Typography key={ex.id} sx={{ fontSize: "1.1rem", mb: 1 }}>
                  {ex.examName} | 📅 {toDateString(ex.examDate)} | 🧪 {ex.examType} | 📘 {courseName}
                </Typography>
              );
            })}

            <Typography variant="h4" sx={{ mt: 3, textDecoration: "underline", mb: 1 }}>
              📝 Assignments
            </Typography>
            {getStudentAssignments().map((a) => {
              const course = getStudentCourses().find((c) => c.courseCode === a.courseCode);
              const courseName = course ? course.courseName : a.courseCode;
              return (
                <Typography key={a.id} sx={{ fontSize: "1.1rem", mb: 1 }}>
                  {a.assignmentTitle} | 📅 Due: {toDateString(a.dueDate)} | 📘 {courseName} | 📝 {a.description}
                </Typography>
              );
            })}

            <Typography variant="h4" sx={{ mt: 3, textDecoration: "underline", mb: 1 }}>
              📢 Events
            </Typography>
            {getStudentEvents().map((ev) => (
              <Typography key={ev.id} sx={{ fontSize: "1.1rem", mb: 1 }}>
                {ev.eventName} | 📅 {toDateString(ev.eventDate)} | 📝 {ev.description}
              </Typography>
            ))}
          </Box>

          <Box mt={4}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="auto"
              events={calendarEvents}
              eventClick={handleEventClick}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
