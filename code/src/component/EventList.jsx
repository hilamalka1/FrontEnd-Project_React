import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { getDocs, deleteDoc, doc, collection } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // ID של אירוע במחיקה

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(firestore, "events"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
        alert("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEdit = (event) => navigate("/add-event", { state: { event } });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event or message?")) return;
    setActionLoading(id);
    try {
      await deleteDoc(doc(firestore, "events", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (timeStr) =>
    new Date(`1970-01-01T${timeStr}:00`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="80vh"
        gap={2}
      >
        <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" color="textSecondary">
          Loading events and messages...
        </Typography>
      </Box>
    );
  }

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
                  {["all", "degree", "course"].includes(event.audienceType) ? "Event" : "Message"}
                </TableCell>
                <TableCell>{event.eventName}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>
                  {event.eventDate}{" "}
                  {event.startTime && event.endTime
                    ? `(${formatTime(event.startTime)} - ${formatTime(event.endTime)})`
                    : ""}
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
                    sx={{ color: '#388e3c' }}
                  >
                    <Edit />
                  </IconButton>

                  <IconButton
                    onClick={() => handleDelete(event.id)}
                    title="Delete"
                    aria-label="delete"
                    sx={{ color: '#d32f2f' }}
                    disabled={actionLoading === event.id}
                  >
                    {actionLoading === event.id ? (
                      <CircularProgress size={20} thickness={5} />
                    ) : (
                      <Delete />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No events or messages available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
  