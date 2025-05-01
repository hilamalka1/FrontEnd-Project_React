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
  IconButton
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  const handleEdit = (event) => {
    navigate("/add-event", { state: { event } });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem("events", JSON.stringify(updated));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Event Management
      </Typography>

      <Box mb={2}>
        <Link to="/add-event">
          <Button variant="contained" startIcon={<Add />}>
            Add New Event
          </Button>
        </Link>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Event Date</TableCell>
              <TableCell>Audience</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.eventName}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.eventDate}</TableCell>
                <TableCell>
                  {event.audienceType === "all"
                    ? "All Students"
                    : event.audienceType === "degree"
                    ? `Degree: ${event.audienceValue}`
                    : event.audienceType === "course"
                    ? `Course: ${event.audienceValue}`
                    : "Specific Students"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(event)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(event.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
