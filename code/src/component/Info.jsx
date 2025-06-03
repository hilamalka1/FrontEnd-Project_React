// Dashboard.jsx - Summary data and statistics (with error handling)
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Divider, List, ListItem, ListItemText
} from "@mui/material";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

const COLORS = ["#81c784", "#aed581", "#c5e1a5", "#e6ee9c"];

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const studentsSnap = await getDocs(collection(firestore, "students"));
      const assignmentsSnap = await getDocs(collection(firestore, "assignments"));
      const examsSnap = await getDocs(collection(firestore, "exams"));
      const eventsSnap = await getDocs(collection(firestore, "events"));

      setStudents(studentsSnap.docs.map(doc => doc.data()));
      setAssignments(assignmentsSnap.docs.map(doc => doc.data()));
      setExams(examsSnap.docs.map(doc => doc.data()));
      setEvents(eventsSnap.docs.map(doc => doc.data()));
    };
    fetchData();
  }, []);

  const degreeCounts = students.reduce((acc, s) => {
    acc[s.degreeProgram] = (acc[s.degreeProgram] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(degreeCounts).map(([key, value]) => ({ name: key, value }));

  const getWeek = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return null;
    const now = new Date();
    const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? null : Math.floor(diffDays / 7) + 1;
  };

  const weeklyData = [1, 2, 3, 4].map((w) => ({
    week: `Week ${w}`,
    Assignments: assignments.filter(a => getWeek(a.dueDate) === w).length,
    Exams: exams.filter(e => getWeek(e.examDate) === w).length
  }));

  const upcomingEvents = events.filter(e => {
    if (!e.eventDate) return false;
    const eventDate = new Date(e.eventDate);
    if (isNaN(eventDate)) return false;
    const today = new Date();
    const diffDays = (eventDate - today) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return isNaN(dateA) || isNaN(dateB) ? 0 : dateA - dateB;
  });

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 2, mb: 4, backgroundColor: '#388e3c', color: 'white' }}>
        <Typography variant="h5" align="center">System Summary Report</Typography>
        <Typography variant="subtitle1" align="center">Data and statistics for the system administrator</Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Student Distribution by Degree</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Assignments and Exams This Month</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Assignments" fill="#81c784" />
            <Bar dataKey="Exams" fill="#aed581" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Upcoming Events This Week</Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {upcomingEvents.length > 0 ? upcomingEvents.map((e, i) => (
            <ListItem key={i}>
              <ListItemText primary={`${e.eventName} - ${new Date(e.eventDate).toLocaleDateString("en-US")}`} />
            </ListItem>
          )) : (
            <ListItem><ListItemText primary="No upcoming events" /></ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}
