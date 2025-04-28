import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';

export default function Header() {
  const navLinks = [
    { label: 'Home Page1', path: '/' },
    { label: 'Students', path: '/students' },
    { label: 'Courses', path: '/courses' },
    { label: 'Assignments', path: '/assignments' },
    { label: 'Exams', path: '/exams' },
    { label: 'Events', path: '/events' },
    { label: 'Info', path: '/info' },        // ✅ קישור לעמוד מידע
    { label: 'Support', path: '/support' }    // ✅ קישור לעמוד תמיכה
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ direction: 'ltr', display: 'flex', gap: 2 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ mr: 2 }}
          >
            OnBoard
          </Typography>

          {navLinks.map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
