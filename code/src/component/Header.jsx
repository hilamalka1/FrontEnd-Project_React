import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
// import Logo from '../assets/loogo.png'; // Import the logo image
import { styled } from '@mui/material/styles';

// const LogoImage = styled('img')({
//   height: '40px', // Adjust the height as needed
//   marginRight: '16px', // Add some spacing between the logo and the text
// });

export default function Header() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          {/* <LogoImage src={Logo} alt="OnBoard Logo" /> Display the logo */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            OnBoard
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
