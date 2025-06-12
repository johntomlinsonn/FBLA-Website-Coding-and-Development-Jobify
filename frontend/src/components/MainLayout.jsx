import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Link as MuiLink,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';

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
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  const [anchorElUserMenu, setAnchorElUserMenu] = React.useState(null);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const handleOpenUserMenu = (event) => {
    setAnchorElUserMenu(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUserMenu(null);
  };

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return `${firstName[0]}`.toUpperCase();
    }
    if (lastName) {
      return `${lastName[0]}`.toUpperCase();
    }
    return 'U'; // Default if no name
  };

  const navigateToAccount = () => {
    navigate('/account');
    handleCloseUserMenu();
  };

  const performUserLogout = () => {
    logout(); // Call existing logout function from useAuth
    handleCloseUserMenu();
    // navigate('/'); // Optional: navigate to home or login after logout
  };

  // Add useEffect for chatbot script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="RSn_LN0OepwcHkSSAHd3N";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`;
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleLogout = () => { // This is the original handleLogout, now wrapped by performUserLogout for menu
    logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';
  const MainContentWrapper = isLandingPage ? Box : Container;
  const wrapperSx = isLandingPage ? { width: '100%', flexGrow: 1 } : { flexGrow: 1, py: 4, pb: 16, px: { xs: 2, md: 'auto' } };

  // Navigation links for AppBar and Drawer (excluding Account/Logout for logged-in users, which are in the menu)
  const navLinkItems = [
    { label: 'Post a Job', onClick: () => navigate('/post-job') }, // Ensure path is correct
    user && { label: 'Browse Jobs', onClick: () => navigate('/jobs') },
    user?.is_staff && { label: 'Admin Panel', onClick: () => navigate('/admin') },
    user?.is_job_provider && { label: 'Find Applicants', onClick: () => navigate('/find-applicants') },
    !user && { label: 'Login', onClick: () => navigate('/login') },
    !user && { label: 'Get Started', onClick: () => navigate('/signup'), isButton: true },
  ].filter(Boolean);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Orange accent bar */}
      {/* <Box sx={{ width: '100%', height: 4, background: 'linear-gradient(90deg, #FF6B00 0%, #FF8C00 100%)', zIndex: 1301 }} /> */}
      {/* Chatbot container with highest z-index */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          '& > *': {
            pointerEvents: 'auto'
          }
        }}
      />
      <AppBar 
        position="static" 
        color="default" 
        elevation={0} 
        sx={{ 
          background: 'rgba(255,255,255,0.98)', 
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)', 
          pt: 2,
          pb: 2,
          position: 'relative',
          zIndex: 1200,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ 
            justifyContent: 'space-between',
            px: { xs: 0, sm: 2 },
            minHeight: { xs: 64, sm: 72 }
          }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { 
                  transform: 'scale(1.02)',
                  opacity: 0.9 
                }
              }}
              onClick={() => navigate('/')}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: 1.5,
                  mr: 1.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' }
                }}
              >
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
                <img
                  src="/logo.svg"
                  alt="Jobify Logo"
                  style={{
                    width: '36px',
                    height: '36px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' // Add a subtle shadow if needed
                  }}
                />
              </motion.div>
            </Box>
            {/* Desktop Nav */}
            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }}>
                {navLinkItems.map((link, i) => (
                  link.isButton ? (
                    <Button 
                      key={link.label}
                      variant="contained" 
                      sx={{ 
                        background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
                        color: '#fff', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 4px 14px 0 rgba(255, 107, 0, 0.3)',
                        transition: 'all 0.3s ease-in-out',
                        ml: 1,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FF8C00, #FF6B00)',
                          boxShadow: '0 6px 20px 0 rgba(255, 107, 0, 0.4)',
                          transform: 'translateY(-1px)'
                        }
                      }} 
                      onClick={link.onClick}
                    >
                      {link.label}
                    </Button>
                  ) : (
                    <Button
                      key={link.label}
                      color="inherit"
                      startIcon={link.icon}
                      sx={{ 
                        color: '#222', 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 107, 0, 0.08)',
                          color: '#FF6B00'
                        }
                      }}
                      onClick={link.onClick}
                    >
                      {link.label}
                    </Button>
                  )
                ))}
                {/* User Avatar and Menu for logged-in users */}
                {user && (
                  <Box sx={{ flexGrow: 0 }}>
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt={user.first_name || user.username || 'User'} src={user.profile_picture_url}>
                        {(!user.profile_picture_url && (user.first_name || user.username)) && getInitials(user.first_name, user.last_name)}
                      </Avatar>
                    </IconButton>
                    <Menu
                      sx={{ mt: '45px' }}
                      id="menu-appbar-user"
                      anchorEl={anchorElUserMenu}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorElUserMenu)}
                      onClose={handleCloseUserMenu}
                    >
                      <MenuItem onClick={navigateToAccount}>
                        <ListItemIcon>
                          <AccountCircleIcon fontSize="small" />
                        </ListItemIcon>
                        Account
                      </MenuItem>
                      <MenuItem onClick={performUserLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                )}
              </Box>
            )}
            {/* Mobile Hamburger */}
            {isMobile && (
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ ml: 1, color: '#FF6B00', zIndex: 1302 }}
              >
                {mobileOpen ? <CloseIcon sx={{ fontSize: 32 }} /> : <MenuIcon sx={{ fontSize: 32 }} />}
              </IconButton>
            )}
          </Toolbar>
        </Container>
        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: "100%",
              maxWidth: 300,
              bgcolor: "#fff",
              borderLeft: "1px solid #eee",
              boxShadow: "-5px 0 15px rgba(0,0,0,0.05)",
            },
          }}
        >
          <Box
            onClick={handleDrawerToggle}
            sx={{ textAlign: "center", pt: 3, pb: 2, borderBottom: "1px solid #eee" }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: 1.5,
                  mr: 1,
                }}
              >
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
                <img
                  src="/logo.svg"
                  alt="Jobify Logo"
                  style={{
                    width: '30px',
                    height: '30px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.1))'
                  }}
                />
              </motion.div>
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <List>
              {navLinkItems.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    sx={{ textAlign: "center", py: 1.5 }}
                    onClick={() => { handleDrawerToggle(); item.onClick(); }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: "1.1rem", fontWeight: 600, color: "#333" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {/* Additional items for Account and Logout in mobile drawer */}
              {user && (
                <>
                  <ListItem disablePadding>
                    <ListItemButton
                      sx={{ textAlign: "center", py: 1.5 }}
                      onClick={() => { handleDrawerToggle(); navigateToAccount(); }}
                    >
                      <ListItemText
                        primary="Account"
                        primaryTypographyProps={{ fontSize: "1.1rem", fontWeight: 600, color: "#333" }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      sx={{ textAlign: "center", py: 1.5 }}
                      onClick={() => { handleDrawerToggle(); performUserLogout(); }}
                    >
                      <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{ fontSize: "1.1rem", fontWeight: 600, color: "#333" }}
                      />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Drawer>
      </AppBar>

      <MainContentWrapper sx={wrapperSx}>
        <Outlet />
      </MainContentWrapper>

      {/* Footer */}
      <Box sx={{
        background: 'rgba(255,255,255,0.98)', // Changed to match header background
        backdropFilter: 'blur(8px)', // Added backdropFilter
        color: '#222', // Text color needs to be dark for light background
        py: { xs: 6, md: 8 },
        textAlign: 'center',
        borderTop: '5px solid #FF6B00', // Orange accent line
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: { xs: 2, md: 0 } }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mr: 1,
                  fontSize: { xs: '1.4rem', md: '1.75rem' }
                }}>
                  Jobify
                </Typography>
                <img
                  src="/logo.svg"
                  alt="Jobify Logo"
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.1))'
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#555', mt: 2, maxWidth: 300, mx: { xs: 'auto', md: '0' }, textAlign: { xs: 'center', md: 'left' } }}>
                Connecting students with their first job opportunities. Building futures, one placement at a time.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#222', textAlign: 'center' }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                {footerLinks.map((link) => (
                  <MuiLink
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      color: '#555',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#FF6B00',
                        transform: 'translateX(5px)',
                      },
                      transition: 'all 0.3s ease',
                      fontSize: '1.05rem',
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#222', textAlign: 'center' }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                {socialLinks.map((link) => (
                  <IconButton
                    key={link.label}
                    component={MuiLink}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#222',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#FF6B00',
                        transform: 'scale(1.2)',
                      },
                      fontSize: '2rem',
                    }}
                    aria-label={link.label}
                  >
                    {link.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ color: '#888', mt: { xs: 6, md: 8 }, fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Jobify. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;