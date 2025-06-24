import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, Stack, FormControl,
  InputLabel, Select, OutlinedInput, Checkbox, ListItemText, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress, Alert,
  useMediaQuery
} from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { addCourse, updateCourse, listStudents } from "../firebase/Courses";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useTheme } from "@mui/material/styles";

const semesterOptions = ["Semester A", "Semester B", "Summer"];
const degreePrograms = [
  "Computer Science", "Software Engineering", "Business Administration",
  "Biology", "Psychology", "Economics", "Education", "Architecture"
];

const validate = {
  name: v => v.trim().length >= 2,
  lecturer: v => /^[֐-׿a-zA-Z\s]+$/.test(v) && v.trim().length >= 2, // ← שונה ל-2 תווים
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.trim().toLowerCase() !== "g"
};

export default function AddCourses() {
  const theme = useTheme(), isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({ courseCode: "", courseName: "", creditPoints: "", semester: "", lecturerName: "", lecturerEmail: "", degreeProgram: "", enrolledStudents: [] });
  const [students, setStudents] = useState([]), [selectedStudents, setSelected] = useState([]);
  const [errors, setErrors] = useState({}), [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [summaryOpen, setSummaryOpen] = useState(false);
  const navigate = useNavigate(), location = useLocation(), { id } = useParams();
  const editing = location.state?.course || null;

  useEffect(() => {
    const init = async () => {
      const data = await listStudents();
      setStudents(data);
      if (id && !editing) {
        const snap = await getDoc(doc(firestore, "courses", id));
        if (snap.exists()) {
          const d = snap.data();
          setFormData(d);
          setSelected(d.enrolledStudents?.map(s => ({ studentId: s.studentId, grade: s.grade || 0 })) || []);
        }
      } else if (editing) {
        setFormData(editing);
        setSelected(editing.enrolledStudents?.map(s => ({ studentId: s.studentId, grade: s.grade || 0 })) || []);
      } else {
        const code = "CRS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData(prev => ({ ...prev, courseCode: code }));
      }
      setLoading(false);
    };
    init();
  }, [editing, id]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const newErr = { ...errors };
    if (name === "courseName" && !validate.name(value)) newErr.courseName = "Must be 2+ chars";
    else if (name === "creditPoints" && !value) newErr.creditPoints = "Required";
    else if (name === "semester" && !value) newErr.semester = "Required";
    else if (name === "lecturerName" && !validate.lecturer(value)) newErr.lecturerName = "Invalid name";
    else if (name === "lecturerEmail" && !validate.email(value)) newErr.lecturerEmail = "Invalid email";
    else if (name === "degreeProgram" && !value) newErr.degreeProgram = "Required";
    else delete newErr[name];
    setErrors(newErr); setGeneralError("");
  };

  const handleSelectStudents = ({ target: { value } }) => {
    const existing = selectedStudents.filter(s => value.includes(s.studentId));
    const added = value.filter(id => !existing.some(s => s.studentId === id)).map(id => ({ studentId: id, grade: 0 }));
    setSelected([...existing, ...added]);
  };

  const handleGradeChange = (id, grade) => setSelected(prev => prev.map(s => s.studentId === id ? { ...s, grade: parseInt(grade) } : s));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setGeneralError("");
    const newErrors = {};
    if (!validate.name(formData.courseName)) newErrors.courseName = "Too short";
    if (!formData.creditPoints) newErrors.creditPoints = "Required";
    if (!formData.semester) newErrors.semester = "Required";
    if (!validate.lecturer(formData.lecturerName)) newErrors.lecturerName = "Invalid";
    if (!validate.email(formData.lecturerEmail)) newErrors.lecturerEmail = "Invalid";
    if (!formData.degreeProgram) newErrors.degreeProgram = "Required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors); setGeneralError("Please fix errors"); setSaving(false);
      return;
    }
    const enrolled = students.filter(s => selectedStudents.some(sel => sel.studentId === s.studentId)).map(s => {
      const match = selectedStudents.find(sel => sel.studentId === s.studentId);
      return { studentId: s.studentId, firstName: s.firstName, lastName: s.lastName, grade: match?.grade || 0, completed: (match?.grade || 0) >= 60 };
    });
    try {
      const course = { ...formData, enrolledStudents: enrolled };
      if (editing || id) await updateCourse(course);
      else await addCourse(course);
      setSummaryOpen(true);
    } catch (err) {
      console.error(err); setGeneralError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" gap={2}>
      <CircularProgress size={60} thickness={5} sx={{ color: "#4caf50" }} />
      <Typography variant="h6" color="textSecondary">Loading course data...</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#e8f5e9", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" mb={3} fontWeight="bold">
        {editing || id ? "Edit Course" : "Add New Course"}
      </Typography>

      <Box component="form" onSubmit={handleSave} sx={{
        display: "flex", flexDirection: "column", maxWidth: isMobile ? "100%" : 600,
        mx: "auto", p: 2, gap: 2, boxShadow: 3, borderRadius: 2, backgroundColor: "#ffffff"
      }}>
        {generalError && <Alert severity="error">{generalError}</Alert>}
        <TextField label="Course Name" name="courseName" fullWidth value={formData.courseName} onChange={handleChange} error={!!errors.courseName} helperText={errors.courseName} />
        <TextField label="Credit Points" name="creditPoints" type="number" fullWidth value={formData.creditPoints} onChange={handleChange} error={!!errors.creditPoints} helperText={errors.creditPoints} />
        <TextField select label="Semester" name="semester" fullWidth value={formData.semester} onChange={handleChange} error={!!errors.semester} helperText={errors.semester}>
          {semesterOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
        <TextField label="Lecturer Name" name="lecturerName" fullWidth value={formData.lecturerName} onChange={handleChange} error={!!errors.lecturerName} helperText={errors.lecturerName} />
        <TextField label="Lecturer Email" name="lecturerEmail" type="email" fullWidth value={formData.lecturerEmail} onChange={handleChange} error={!!errors.lecturerEmail} helperText={errors.lecturerEmail} />
        <TextField select label="Degree Program" name="degreeProgram" fullWidth value={formData.degreeProgram} onChange={handleChange} error={!!errors.degreeProgram} helperText={errors.degreeProgram}>
          {degreePrograms.map(deg => <MenuItem key={deg} value={deg}>{deg}</MenuItem>)}
        </TextField>

        <FormControl fullWidth>
          <InputLabel>Select Students</InputLabel>
          <Select
            multiple
            value={selectedStudents.map(s => s.studentId)}
            onChange={handleSelectStudents}
            input={<OutlinedInput label="Select Students" />}
            renderValue={selected => selected.map(id => {
              const s = students.find(stu => stu.studentId === id);
              return s ? `${s.firstName} ${s.lastName}` : id;
            }).join(", ")}
          >
            {students.map(s => (
              <MenuItem key={s.studentId} value={s.studentId}>
                <Checkbox checked={selectedStudents.some(sel => sel.studentId === s.studentId)} />
                <ListItemText primary={`${s.firstName} ${s.lastName}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedStudents.length > 0 && (
          <Box>
            <Typography fontWeight="bold">Enter Grades</Typography>
            <Stack spacing={1} mt={1}>
              {selectedStudents.map(({ studentId, grade }) => {
                const s = students.find(stu => stu.studentId === studentId);
                return s ? (
                  <Box key={studentId} display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ minWidth: 150 }}>{s.firstName} {s.lastName}</Typography>
                    <TextField type="number" label="Grade" value={grade} onChange={(e) => handleGradeChange(studentId, e.target.value)} sx={{ width: 100 }} inputProps={{ min: 0, max: 100 }} />
                  </Box>
                ) : null;
              })}
            </Stack>
          </Box>
        )}

        <Stack direction="row" spacing={2} mt={2} justifyContent="center">
          <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 140, bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}>
            {saving ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Save"}
          </Button>
          <Button onClick={() => navigate("/courses")} variant="outlined" sx={{ minWidth: 140, borderColor: "#4caf50", color: "#4caf50", '&:hover': { bgcolor: "#e8f5e9" } }}>
            Cancel
          </Button>
        </Stack>
      </Box>

      <Dialog open={summaryOpen} onClose={() => { setSummaryOpen(false); navigate("/courses"); }} fullWidth>
        <DialogTitle>Course Saved</DialogTitle>
        <DialogContent>
          <Typography>Course was successfully saved or updated.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSummaryOpen(false); navigate("/courses"); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
