import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, FormControl,
  InputLabel, Select, Checkbox, ListItemText, OutlinedInput, CircularProgress, useMediaQuery, FormHelperText, Alert, Stack
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { addDoc, collection, updateDoc, doc, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useTheme } from "@mui/material/styles";

export default function AddEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const editingEvent = location.state?.event || null;

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    eventName: "", description: "", eventDate: "",
    startTime: "", endTime: "",
    audienceType: "all", audienceValue: ""
  });

  const [error, setError] = useState({});
  const [generalError, setGeneralError] = useState("");

  const degreePrograms = [
    "Computer Science", "Software Engineering", "Business Administration",
    "Biology", "Psychology", "Economics", "Education", "Architecture"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseSnap = await getDocs(collection(firestore, "courses"));
        const studentSnap = await getDocs(collection(firestore, "students"));
        setCourses(courseSnap.docs.map(doc => doc.data()));
        setStudents(studentSnap.docs.map(doc => doc.data()));
        if (editingEvent) {
          setFormData({ ...editingEvent });
          if (editingEvent.audienceType === "students") {
            setSelectedStudents(editingEvent.audienceValue || []);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [editingEvent]);

  const validateField = (name, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return "This field is required";
    if (name === "eventDate" && new Date(value) < new Date().setHours(0, 0, 0, 0)) return "Event date cannot be in the past";
    if (name === "endTime" && formData.startTime && value < formData.startTime) return "End time cannot be before start time";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setGeneralError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "audienceValue") newErrors[key] = validateField(key, formData[key]);
    });

    if (formData.audienceType === "degree" || formData.audienceType === "course") {
      newErrors.audienceValue = validateField("audienceValue", formData.audienceValue);
    }
    if (formData.audienceType === "students" && selectedStudents.length === 0) {
      newErrors.audienceValue = "Select at least one student";
    }

    setError(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const finalAudienceValue = formData.audienceType === "students" ? selectedStudents : formData.audienceValue;
    const dataToSave = { ...formData, audienceValue: finalAudienceValue };

    setSaving(true);
    try {
      if (editingEvent?.id) {
        const ref = doc(firestore, "events", editingEvent.id);
        await updateDoc(ref, dataToSave);
        alert("Event updated successfully!");
      } else {
        await addDoc(collection(firestore, "events"), dataToSave);
        alert("Event saved successfully!");
      }
      navigate("/events");
    } catch (err) {
      console.error("Error saving event:", err);
      setGeneralError("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const renderAudienceSelect = () => {
    if (formData.audienceType === "degree") {
      return (
        <TextField select fullWidth label="Select Degree *" name="audienceValue"
          value={formData.audienceValue} onChange={handleChange}
          error={!!error.audienceValue} helperText={error.audienceValue}>
          {degreePrograms.map((deg) => <MenuItem key={deg} value={deg}>{deg}</MenuItem>)}
        </TextField>
      );
    }
    if (formData.audienceType === "course") {
      return (
        <TextField select fullWidth label="Select Course *" name="audienceValue"
          value={formData.audienceValue} onChange={handleChange}
          error={!!error.audienceValue} helperText={error.audienceValue}>
          {courses.map((c) => (
            <MenuItem key={c.courseCode} value={c.courseCode}>
              {c.courseName} ({c.courseCode})
            </MenuItem>
          ))}
        </TextField>
      );
    }
    if (formData.audienceType === "students") {
      return (
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
                <Checkbox checked={selectedStudents.includes(s.studentId)} />
                <ListItemText primary={`${s.firstName} ${s.lastName}`} />
              </MenuItem>
            ))}
          </Select>
          {error.audienceValue && <FormHelperText error>{error.audienceValue}</FormHelperText>}
        </FormControl>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" gap={2}>
        <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" color="textSecondary">Loading form data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant={isMobile ? "h5" : "h4"} align="center" mb={3} fontWeight="bold">
        {editingEvent ? "Edit Event" : "Add New Event"}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSave}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 600,
          mx: "auto",
          p: 4,
          gap: 2,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        {generalError && <Alert severity="error">{generalError}</Alert>}

        <TextField label="Event Name *" name="eventName" value={formData.eventName} onChange={handleChange} error={!!error.eventName} helperText={error.eventName} fullWidth />
        <TextField label="Description *" name="description" value={formData.description} onChange={handleChange} error={!!error.description} helperText={error.description} multiline rows={3} fullWidth />
        <TextField label="Event Date *" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} error={!!error.eventDate} helperText={error.eventDate} InputLabelProps={{ shrink: true }} fullWidth />
        <TextField label="Start Time *" name="startTime" type="time" value={formData.startTime} onChange={handleChange} error={!!error.startTime} helperText={error.startTime} InputLabelProps={{ shrink: true }} fullWidth />
        <TextField label="End Time *" name="endTime" type="time" value={formData.endTime} onChange={handleChange} error={!!error.endTime} helperText={error.endTime} InputLabelProps={{ shrink: true }} fullWidth />

        <FormControl fullWidth required>
          <InputLabel>Audience</InputLabel>
          <Select name="audienceType" value={formData.audienceType} label="Audience" onChange={handleChange} input={<OutlinedInput label="Audience *" />}>
            <MenuItem value="all">All Students</MenuItem>
            <MenuItem value="degree">Specific Degree</MenuItem>
            <MenuItem value="course">Specific Course</MenuItem>
            <MenuItem value="students">Specific Students</MenuItem>
          </Select>
        </FormControl>

        {renderAudienceSelect()}

        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ minWidth: 140, bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}
          >
            {saving ? <CircularProgress size={24} sx={{ color: "white" }} /> : editingEvent ? "Update Event" : "Add Event"}
          </Button>

          <Button
            onClick={() => navigate("/events")}
            variant="outlined"
            sx={{ minWidth: 140, borderColor: "#4caf50", color: "#4caf50", '&:hover': { bgcolor: "#e8f5e9" } }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
