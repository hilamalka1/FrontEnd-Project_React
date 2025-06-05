import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
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

  const completedCourses = courses.filter((course) =>
    course.enrolledStudents?.some(
      (s) =>
        s.studentId === selectedStudent.studentId &&
        typeof s.grade === "number" &&
        s.grade >= 60
    )
  );

  const totalCredits = completedCourses.reduce(
    (sum, course) => sum + Number(course.creditPoints || 0),
    0
  );

  const pieData = [
    { name: "Completed Credits", value: totalCredits },
    {
      name: "Remaining Credits",
      value: Math.max(TOTAL_REQUIRED_CREDITS - totalCredits, 0),
    },
  ];

  const isEligible = totalCredits >= TOTAL_REQUIRED_CREDITS;

  useEffect(() => {
    if (isEligible && !showConfetti) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setShowConfetti(true);
    }
  }, [isEligible, showConfetti]);

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
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Welcome, {selectedStudent.name}!
      </Typography>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          width: 350,
          textAlign: "center",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={500}>
          Overall Completion
        </Typography>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {isEligible && (
          <Typography variant="h6" color="success.main" fontWeight={600} mt={2}>
            🎓 Congratulations! You are eligible for a degree.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
