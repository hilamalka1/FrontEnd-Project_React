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
    { label: 'Home', path: '/' },
    { label: 'Students', path: '/students' },
    { label: 'Courses', path: '/courses' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ direction: 'ltr', display: 'flex', gap: 2 }}>
          
          {/* App name on the far left */}
          <Typography
            variant="h6"
            component="div"
            sx={{ mr: 2 }}
          >
            OnBoard
          </Typography>

          {/* Navigation links follow the app name */}
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