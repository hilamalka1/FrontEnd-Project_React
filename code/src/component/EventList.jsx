// EventList.jsx - גרסה מתקדמת עם Firestore ופורמט אמריקאי לשעות
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { getDocs, deleteDoc, doc, collection } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(collection(firestore, "events"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const handleEdit = (event) => navigate("/add-event", { state: { event } });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event or message?")) return;
    await deleteDoc(doc(firestore, "events", id));
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const formatTime = (timeStr) =>
    new Date(`1970-01-01T${timeStr}:00`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        Event & Message Management
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Button
          component={Link}
          to="/add-event"
          variant="contained"
          startIcon={<Add sx={{ color: "#ffffff" }} />}
          sx={{
            backgroundColor: '#66bb6a',
            color: 'white',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#4caf50' }
          }}
        >
          Add New Event / Message
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e8f5e9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Event/Message Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Audience</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length > 0 ? events.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>
                  {event.audienceType === "all" || event.audienceType === "degree" || event.audienceType === "course"
                    ? "Event"
                    : "Message"}
                </TableCell>
                <TableCell>{event.eventName}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>
                  {event.eventDate} {event.startTime && event.endTime ? `(${formatTime(event.startTime)} - ${formatTime(event.endTime)})` : ""}
                </TableCell>
                <TableCell>
                  {event.audienceType === "all"
                    ? "All Students"
                    : event.audienceType === "degree"
                      ? `Degree: ${event.audienceValue}`
                      : event.audienceType === "course"
                        ? `Course: ${event.audienceValue}`
                        : Array.isArray(event.audienceValue)
                          ? `Students: ${event.audienceValue.length}`
                          : "Specific Students"}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(event)}
                    title="Edit"
                    aria-label="edit"
                    size="large"
                    sx={{ color: '#388e3c' }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(event.id)}
                    title="Delete"
                    aria-label="delete"
                    size="large"
                    sx={{ color: '#d32f2f' }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No events or messages available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
