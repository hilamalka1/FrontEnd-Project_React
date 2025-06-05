// Dashboard.jsx – Student progress with gamification
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, MenuItem, Select, FormControl, InputLabel, LinearProgress, Avatar, Grid
} from "@mui/material";
import { EmojiEvents, Star, School } from "@mui/icons-material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

const TOTAL_REQUIRED_CREDITS = 120;
const COLORS = ["#81c784", "#e0e0e0"];

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const studentsSnap = await getDocs(collection(firestore, "students"));
      const coursesSnap = await getDocs(collection(firestore, "courses"));

      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCourses(coursesSnap.docs.map(doc => doc.data()));
    };
    fetchData();
  }, []);

  const calculateStudentCredits = (studentId) => {
    let total = 0;
    courses.forEach(course => {
      if (Array.isArray(course.enrolledStudents)) {
        const isEnrolled = course.enrolledStudents.some(s => s.id === studentId);
        if (isEnrolled) {
          total += parseInt(course.creditPoints);
        }
      }
    });
    return total;
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const earnedCredits = selectedStudentId ? calculateStudentCredits(selectedStudentId) : 0;
  const percent = ((earnedCredits / TOTAL_REQUIRED_CREDITS) * 100).toFixed(1);

  const pieData = [
    { name: "Completed", value: earnedCredits },
    { name: "Remaining", value: TOTAL_REQUIRED_CREDITS - earnedCredits }
  ];

  const getLevel = (credits) => {
    if (credits >= 100) return "🎓 Final Level";
    if (credits >= 80) return "⭐ Expert";
    if (credits >= 50) return "🔥 Intermediate";
    if (credits >= 20) return "📘 Beginner";
    return "👶 Newbie";
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>🎮 Student Progress Tracker</Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Student</InputLabel>
          <Select
            value={selectedStudentId}
            label="Select Student"
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map(student => (
              <MenuItem key={student.id} value={student.id}>
                {student.firstName?.trim()} {student.lastName?.trim()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedStudentId && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedStudent?.firstName?.trim()} {selectedStudent?.lastName?.trim()} - {earnedCredits} / {TOTAL_REQUIRED_CREDITS} credits
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{ height: 12, borderRadius: 5 }}
              />
              <Typography sx={{ mt: 1 }}>Progress: {percent}%</Typography>
              <Typography color="text.secondary">
                {TOTAL_REQUIRED_CREDITS - earnedCredits} credits remaining to graduate
              </Typography>
              <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                Level: {getLevel(earnedCredits)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
}