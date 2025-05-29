import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ 
        background: 'rgba(255,255,255,0.95)', 
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)', 
        pt: 2,
        position: 'relative',
        zIndex: 1200 
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF6B00', letterSpacing: 2 }}>
            Jobify
          </Typography>
          <Box>
            <Button
              color="inherit"
              sx={{ color: '#222', fontWeight: 600, mr: 2 }}
              onClick={() => { user ? navigate('/jobs/create') : navigate('/login'); }}
            >
              Post a Job
            </Button>
            {user ? (
              <>
                <Button
                  color="inherit"
                  sx={{ color: '#222', fontWeight: 600, mr: 1 }}
                  onClick={() => navigate('/account')}
                  startIcon={<SettingsIcon />}
                >
                  Account
                </Button>
                <Button color="inherit" sx={{ color: '#222', fontWeight: 600, mr: 2 }} onClick={() => navigate('/jobs')}>Browse Jobs</Button>
                {user?.is_staff && (
                  <Button color="inherit" sx={{ color: '#222', fontWeight: 600, mr: 2 }} onClick={() => navigate('/admin')}>Admin Panel</Button>
                )}
              </>
            ) : (
              <>
                <Button color="inherit" sx={{ color: '#222', fontWeight: 600, mr: 2 }} onClick={() => navigate('/login')}>Login</Button>
                <Button variant="contained" sx={{ background: '#FF6B00', color: '#fff', fontWeight: 600, boxShadow: 2 }} onClick={() => navigate('/signup')}>Get Started</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Jobify. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 