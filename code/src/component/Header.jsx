import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const managementLinks = [
    { label: 'Students', path: '/students' },
    { label: 'Courses', path: '/courses' },
    { label: 'Assignments', path: '/assignments' },
    { label: 'Exams', path: '/exams' },
    { label: 'Event & Message', path: '/events' },
    { label: 'Support', path: '/support' },
  ];

  const navLinks = [
    { label: 'Home Page', path: '/' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'success.main' }}>
        <Toolbar sx={{ justifyContent: 'space-between', direction: 'ltr' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
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
          </Box>


          <Box>
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ textTransform: 'none' }}
            >
              User Management
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {managementLinks.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    handleMenuClose();
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
