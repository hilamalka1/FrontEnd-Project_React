// Dashboard.jsx – כולל גרפים משודרגים עם כותרת בולטת, שמירת פריסה יפה ורוחב
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useStudent } from "./StudentContext";
import confetti from "canvas-confetti";

const TOTAL_REQUIRED_CREDITS = 120;
const COLORS = ["#4caf50", "#aed581"];

export default function Dashboard() {
  const { selectedStudent } = useStudent();
  const [courses, setCourses] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const coursesSnap = await getDocs(collection(firestore, "courses"));
      const coursesData = coursesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesData);
    };

    fetchData();
  }, []);

  if (!selectedStudent) {
    return (
      <Box p={4} bgcolor="#e8f5e9" minHeight="100vh">
        <Typography variant="h5">Please select a student.</Typography>
      </Box>
    );
  }

  const enrolledWithGrades = courses.flatMap((course) => {
    const match = course.enrolledStudents?.find(
      (s) => s.studentId === selectedStudent.studentId && typeof s.grade === "number"
    );
    return match ? [{ ...course, grade: match.grade }] : [];
  });

  const completedCourses = enrolledWithGrades.filter((c) => c.grade >= 60);
  const totalCredits = completedCourses.reduce((sum, course) => sum + Number(course.creditPoints || 0), 0);

  const pieData = [
    { name: "Completed Credits", value: totalCredits },
    { name: "Remaining Credits", value: Math.max(TOTAL_REQUIRED_CREDITS - totalCredits, 0) },
  ];

  const averageGrade = enrolledWithGrades.length
    ? enrolledWithGrades.reduce((sum, c) => sum + c.grade, 0) / enrolledWithGrades.length
    : 0;

  const isEligible = totalCredits >= TOTAL_REQUIRED_CREDITS;

  useEffect(() => {
    if (isEligible && !showConfetti) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setShowConfetti(true);
    }
  }, [isEligible, showConfetti]);

  const gradeDistribution = enrolledWithGrades.map((c) => ({
    course: c.courseName,
    grade: c.grade
  }));

  return (
    <Box
      sx={{
        bgcolor: "#e8f5e9",
        minHeight: "100vh",
        py: 5,
        px: { xs: 2, md: 5 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Dashboard for {selectedStudent.firstName} {selectedStudent.lastName}
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff" }}>
            <Typography variant="h6" fontWeight={500}>Average Grade</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{ name: "Average", grade: Math.round(averageGrade) }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="grade" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
            <Typography variant="body1" fontWeight={500} mt={1}>
              {enrolledWithGrades.length ? `Based on ${enrolledWithGrades.length} courses` : "No grades available"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff" }}>
            <Typography variant="h6" fontWeight={500}>Grade Distribution by Course</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" angle={-45} textAnchor="end" interval={0} height={70} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="grade" fill="#64b5f6" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={12}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff" }}>
            <Typography variant="h6" fontWeight={500} mb={2}>Grades by Course</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Course Name</strong></TableCell>
                    <TableCell><strong>Grade</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrolledWithGrades.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell>{course.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box width="100%" maxWidth={800} mt={5}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff" }}>
          <Typography variant="h5" fontWeight={600} mb={2}>Overall Completion</Typography>
          <Box width="100%" height={500}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={120} outerRadius={180} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          {isEligible && (
            <Typography variant="h6" color="success.main" fontWeight={600} mt={2}>
              🎓 Congratulations! You are eligible for a degree.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
