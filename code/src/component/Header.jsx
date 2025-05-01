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
      <AppBar
        position="static"
        sx={{ bgcolor: 'success.main' }}  
      >
        <Toolbar sx={{ direction: 'ltr', display: 'flex', gap: 2 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              '&:hover': { textDecoration: 'underline' },
            }}
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
