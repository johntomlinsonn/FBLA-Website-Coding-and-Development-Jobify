import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Link as MuiLink,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
];

const socialLinks = [
  { icon: <FacebookIcon />, href: 'https://facebook.com', label: 'Facebook' },
  { icon: <TwitterIcon />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <InstagramIcon />, href: 'https://instagram.com', label: 'Instagram' },
  { icon: <LinkedInIcon />, href: 'https://linkedin.com', label: 'LinkedIn' },
];

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
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => navigate('/')}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF6B00', letterSpacing: 2, mr: 1 }}>
              Jobify
            </Typography>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF6B00" />
                    <stop offset="1" stopColor="#FFD6B0" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="url(#orangeGrad)" />
                <rect x="35" y="35" width="50" height="50" rx="12" fill="#fff" opacity="0.7" />
                <rect x="50" y="50" width="20" height="20" rx="5" fill="#FF6B00" />
              </svg>
            </motion.div>
          </Box>
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

      <Container component="main" sx={{ flexGrow: 1, py: 4, pb: 16 }}>
        <Outlet />
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          width: '100%', 
          background: '#fff', 
          color: '#222', 
          borderTop: '1px solid #eee', 
          pt: 6, 
          pb: 3, 
          px: { xs: 2, md: 8 }, 
          mt: 8,
          position: 'relative',
          zIndex: 1300,
        }} 
        component="footer"
      >
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 4 }}>
          {/* Logo */}
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF6B00', letterSpacing: 2 }}>
              Jobify
            </Typography>
          </Box>
          {/* Links */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: { xs: 2, md: 0 } }}>
            {footerLinks.map(link => (
              <MuiLink 
                key={link.label} 
                href={link.href} 
                underline="none" 
                sx={{ 
                  color: '#222', 
                  fontWeight: 500, 
                  fontSize: '1.1rem', 
                  opacity: 0.85, 
                  transition: 'opacity 0.2s', 
                  '&:hover': { 
                    opacity: 1, 
                    color: '#FF6B00' 
                  } 
                }}
              >
                {link.label}
              </MuiLink>
            ))}
          </Box>
          {/* Socials & Copyright */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', md: 'row' }, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map(social => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{ 
                    color: '#222', 
                    transition: 'color 0.2s', 
                    '&:hover': { 
                      color: '#FF6B00',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    } 
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' }, opacity: 0.7, fontSize: '1rem', ml: { md: 2 } }}>
              © {new Date().getFullYear()} Jobify. All rights reserved.
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 