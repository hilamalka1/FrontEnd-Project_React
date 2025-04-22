import React, { useEffect, useState } from 'react';
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
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Static default students
const defaultStudents = [
  {
    firstName: 'Hila',
    lastName: 'Malka',
    studentId: '123456789',
    email: 'hila.malka@example.com',
    academicYear: '1',
    studyProgram: 'Computer Science',
  },
  {
    firstName: 'Noa',
    lastName: 'Cohen',
    studentId: '987654321',
    email: 'noa.cohen@example.com',
    academicYear: '2',
    studyProgram: 'Psychology',
  },
  {
    firstName: 'Daniel',
    lastName: 'Avraham',
    studentId: '456789123',
    email: 'daniel.avraham@example.com',
    academicYear: '3',
    studyProgram: 'Software Engineering',
  }
];

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const nameRegex = /^[A-Za-z\u0590-\u05FF]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const saved = localStorage.getItem('students');
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setStudents(parsed);
      } else {
        throw new Error('Invalid data');
      }
    } catch {
      localStorage.setItem('students', JSON.stringify(defaultStudents));
      setStudents(defaultStudents);
    }
  }, []);

  const filtered = students.filter((s) =>
    [s.firstName, s.lastName, s.studentId, s.email]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditData({ ...students[index] });
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    setEditErrors({ ...editErrors, [name]: validateField(name, value) });
  };

  const validateField = (name, value) => {
    if (!value.trim()) return 'This field is required';

    switch (name) {
      case 'firstName':
      case 'lastName':
        return nameRegex.test(value)
          ? ''
          : 'Only Hebrew or English letters, at least 2 characters';
      case 'studentId':
        return /^[0-9]{9}$/.test(value)
          ? ''
          : 'Student ID must be exactly 9 digits';
      case 'email':
        return emailRegex.test(value)
          ? ''
          : 'Invalid email format';
      default:
        return '';
    }
  };

  const handleEditSave = () => {
    const newErrors = {};
    Object.keys(editData).forEach((key) => {
      newErrors[key] = validateField(key, editData[key] || '');
    });

    setEditErrors(newErrors);

    const hasError = Object.values(newErrors).some((err) => err);
    if (hasError) return;

    const updated = [...students];
    updated[editIndex] = editData;
    setStudents(updated);
    localStorage.setItem('students', JSON.stringify(updated));
    setEditIndex(null);
    setEditData({});
  };

  const handleDelete = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;
    const updated = [...students];
    updated.splice(index, 1);
    setStudents(updated);
    localStorage.setItem('students', JSON.stringify(updated));
  };

  return (
    <Box p={4} sx={{ direction: 'ltr' }}>
      <Typography variant="h4" mb={3}>Student Management</Typography>

      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={3}>
        <Link to="/add-student">
          <Button variant="contained" startIcon={<Add />}>
            Add Student
          </Button>
        </Link>
        <TextField
          placeholder="Search by name, ID or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '300px' }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Study Program</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.academicYear}</TableCell>
                <TableCell>{student.studyProgram}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(index)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(index)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editIndex !== null} onClose={() => setEditIndex(null)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label='First Name'
            name="firstName"
            value={editData.firstName || ''}
            onChange={handleEditChange}
            error={!!editErrors.firstName}
            helperText={editErrors.firstName}
          />
          <TextField
            label='Last Name'
            name="lastName"
            value={editData.lastName || ''}
            onChange={handleEditChange}
            error={!!editErrors.lastName}
            helperText={editErrors.lastName}
          />
          <TextField
            label='Student ID'
            name="studentId"
            value={editData.studentId || ''}
            onChange={handleEditChange}
            error={!!editErrors.studentId}
            helperText={editErrors.studentId}
          />
          <TextField
            label='Email'
            name="email"
            value={editData.email || ''}
            onChange={handleEditChange}
            error={!!editErrors.email}
            helperText={editErrors.email}
          />
          <TextField
            label='Academic Year'
            name="academicYear"
            value={editData.academicYear || ''}
            onChange={handleEditChange}
          />
          <TextField
            label='Study Program'
            name="studyProgram"
            value={editData.studyProgram || ''}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditIndex(null)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
