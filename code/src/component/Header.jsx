import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School'; 

export default function Header() {
  const navLinks = [
    { label: 'Home Page', path: '/' },
    { label: 'Students', path: '/students' },
    { label: 'Courses', path: '/courses' },
    { label: 'Assignments', path: '/assignments' },
    { label: 'Exams', path: '/exams' },
    { label: 'Events/Messages', path: '/events' },
    { label: 'Info', path: '/info' },
    { label: 'Support', path: '/support' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'success.main' }}>
        <Toolbar sx={{ direction: 'ltr', display: 'flex', gap: 2 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 2,
            }}
          >
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              OnBoard
            </Typography>
          </Box>

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
