import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

export default function StudentManager() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    academicYear: '',
    studyProgram: '',
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('students');
    if (saved) setStudents(JSON.parse(saved));
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'יש להזין שם מלא';
    if (!/^\d{9}$/.test(formData.studentId)) newErrors.studentId = 'ת.ז חייבת להכיל בדיוק 9 ספרות';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'כתובת מייל לא תקינה';
    if (!formData.academicYear) newErrors.academicYear = 'יש להזין שנה אקדמית';
    if (!formData.studyProgram) newErrors.studyProgram = 'יש להזין חוג לימוד';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStudent = () => {
    if (!validate()) return;
    const updated = [...students, formData];
    setStudents(updated);
    localStorage.setItem('students', JSON.stringify(updated));
    setFormData({ fullName: '', studentId: '', email: '', academicYear: '', studyProgram: '' });
    setErrors({});
  };

  const filteredStudents = students.filter(s =>
    [s.fullName, s.studentId, s.email].some(field => field.includes(searchTerm))
  );

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h4" textAlign="center" mb={3}>
        ניהול סטודנטים
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStudent}>
          הוספת סטודנט
        </Button>
        <TextField
          variant="outlined"
          placeholder="חיפוש לפי שם, ת.ז או אימייל..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '50%' }}
        />
      </Box>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="שם מלא"
          name="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          error={!!errors.fullName}
          helperText={errors.fullName}
        />
        <TextField
          label="תעודת זהות"
          name="studentId"
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value.replace(/\D/g, '') })}
          inputProps={{ maxLength: 9 }}
          error={!!errors.studentId}
          helperText={errors.studentId}
        />
        <TextField
          label="אימייל"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          label="שנה אקדמית"
          name="academicYear"
          type="number"
          value={formData.academicYear}
          onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
          error={!!errors.academicYear}
          helperText={errors.academicYear}
        />
        <TextField
          label="חוג לימוד"
          name="studyProgram"
          value={formData.studyProgram}
          onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
          error={!!errors.studyProgram}
          helperText={errors.studyProgram}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם מלא</TableCell>
              <TableCell>ת.ז</TableCell>
              <TableCell>אימייל</TableCell>
              <TableCell>שנה אקדמית</TableCell>
              <TableCell>חוג לימוד</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.fullName}</TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.academicYear}</TableCell>
                <TableCell>{student.studyProgram}</TableCell>
                <TableCell>
                  <IconButton>
                    <EditIcon />
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