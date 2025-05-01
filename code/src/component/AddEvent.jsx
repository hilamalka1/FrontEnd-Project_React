import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingEvent = location.state?.event || null;

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    eventDate: "",
    audienceType: "all",
    audienceValue: "",
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState({});

  const degreePrograms = [
    "Computer Science",
    "Software Engineering",
    "Business Administration",
    "Biology",
    "Psychology",
    "Economics",
    "Education",
    "Architecture"
  ];

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    const savedStudents = localStorage.getItem("students");

    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedStudents) setStudents(JSON.parse(savedStudents));

    if (editingEvent) {
      setFormData({
        eventName: editingEvent.eventName,
        description: editingEvent.description,
        eventDate: editingEvent.eventDate,
        audienceType: editingEvent.audienceType,
        audienceValue: editingEvent.audienceType === "students" ? [] : editingEvent.audienceValue,
      });
      if (editingEvent.audienceType === "students") {
        setSelectedStudents(editingEvent.audienceValue || []);
      }
    }
  }, [editingEvent]);

  const validateField = (name, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return "This field is required";
    }
    if (name === "eventDate" && new Date(value) < new Date().setHours(0, 0, 0, 0)) {
      return "Event date cannot be in the past";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "audienceValue") {
        newErrors[key] = validateField(key, formData[key]);
      }
    });

    if (formData.audienceType === "degree" || formData.audienceType === "course") {
      newErrors.audienceValue = validateField("audienceValue", formData.audienceValue);
    }
    if (formData.audienceType === "students" && selectedStudents.length === 0) {
      newErrors.audienceValue = "Select at least one student";
    }

    setError(newErrors);

    const hasError = Object.values(newErrors).some((val) => val);
    if (hasError) {
      alert("Please fix all errors before submitting");
      return;
    }

    const saved = localStorage.getItem('events');
    const eventsArray = saved ? JSON.parse(saved) : [];

    const finalAudienceValue = formData.audienceType === "students" ? selectedStudents : formData.audienceValue;

    let updated;
    if (editingEvent) {
      updated = eventsArray.map(ev =>
        ev.id === editingEvent.id
          ? { ...editingEvent, ...formData, audienceValue: finalAudienceValue }
          : ev
      );
    } else {
      const newEvent = {
        ...formData,
        id: Date.now(),
        audienceValue: finalAudienceValue
      };
      updated = [...eventsArray, newEvent];
    }

    localStorage.setItem("events", JSON.stringify(updated));
    alert("Event saved successfully!");
    navigate("/events");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSave}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 500,
        mx: "auto",
        p: 4,
        gap: 2,
        boxShadow: 3,
        backgroundColor: "#f9f9f9",
        borderRadius: 2
      }}
    >
      <Typography variant="h5" align="center" mb={2} fontWeight="bold">
        {editingEvent ? "Edit Event" : "Add New Event"}
      </Typography>

      <TextField
        label="Event Name *"
        name="eventName"
        value={formData.eventName}
        onChange={handleChange}
        error={!!error.eventName}
        helperText={error.eventName}
      />

      <TextField
        label="Description *"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={!!error.description}
        helperText={error.description}
        multiline
        rows={3}
      />

      <TextField
        label="Event Date *"
        name="eventDate"
        type="date"
        value={formData.eventDate}
        onChange={handleChange}
        error={!!error.eventDate}
        helperText={error.eventDate}
        InputLabelProps={{ shrink: true }}
      />

      <FormControl fullWidth>
        <InputLabel>Audience *</InputLabel>
        <Select
          name="audienceType"
          value={formData.audienceType}
          onChange={handleChange}
          input={<OutlinedInput label="Audience *" />}
        >
          <MenuItem value="all">All Students</MenuItem>
          <MenuItem value="degree">Specific Degree</MenuItem>
          <MenuItem value="course">Specific Course</MenuItem>
          <MenuItem value="students">Specific Students</MenuItem>
        </Select>
      </FormControl>

      {formData.audienceType === "degree" && (
        <TextField
          select
          label="Select Degree *"
          name="audienceValue"
          value={formData.audienceValue}
          onChange={handleChange}
          error={!!error.audienceValue}
          helperText={error.audienceValue}
        >
          {degreePrograms.map((deg, index) => (
            <MenuItem key={index} value={deg}>
              {deg}
            </MenuItem>
          ))}
        </TextField>
      )}

      {formData.audienceType === "course" && (
        <TextField
          select
          label="Select Course *"
          name="audienceValue"
          value={formData.audienceValue}
          onChange={handleChange}
          error={!!error.audienceValue}
          helperText={error.audienceValue}
        >
          {courses.map((c, index) => (
            <MenuItem key={index} value={c.courseCode}>
              {c.courseName} ({c.courseCode})
            </MenuItem>
          ))}
        </TextField>
      )}

      {formData.audienceType === "students" && (
        <FormControl fullWidth>
          <InputLabel>Select Students *</InputLabel>
          <Select
            multiple
            value={selectedStudents}
            onChange={(e) => setSelectedStudents(e.target.value)}
            input={<OutlinedInput label="Select Students *" />}
            renderValue={(selected) =>
              selected.map(id => {
                const student = students.find(s => s.studentId === id);
                return student ? `${student.firstName} ${student.lastName}` : id;
              }).join(", ")
            }
          >
            {students.map((s) => (
              <MenuItem key={s.studentId} value={s.studentId}>
                <Checkbox checked={selectedStudents.indexOf(s.studentId) > -1} />
                <ListItemText primary={`${s.firstName} ${s.lastName}`} />
              </MenuItem>
            ))}
          </Select>
          {error.audienceValue && (
            <Typography color="error" variant="caption">{error.audienceValue}</Typography>
          )}
        </FormControl>
      )}

      <Button
        variant="contained"
        type="submit"
        sx={{ backgroundColor: '#66bb6a', '&:hover': { backgroundColor: '#4caf50' } }}
      >
        {editingEvent ? "Update Event" : "Save Event"}
      </Button>

      <Button variant="outlined" onClick={() => navigate("/events")}>Cancel</Button>
    </Box>
  );
}