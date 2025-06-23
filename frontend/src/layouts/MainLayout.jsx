import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Link,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from '../store/slices/authSlice';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ minHeight: 72 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              pr: 2
            }}
          >
            State Jobify
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
            <Tooltip title="Click here or drag to reveal more options" arrow>
              <IconButton size="small" sx={{ color: '#FF9100', mb: 0.5 }}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{
              borderRightWidth: 5,
              borderColor: '#FF9100',
              minHeight: 40,
              borderRadius: 2,
              background: '#FF9100',
              width: 0,
              mx: 0,
              my: 0
            }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, justifyContent: 'flex-end' }}>
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/account"
                >
                  My Account
                </Button>
                {user?.is_staff && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                  >
                    Admin Panel
                  </Button>
                )}
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/inbox"
                >
                  Inbox
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' State Jobify - FBLA Job Board. All rights reserved.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;