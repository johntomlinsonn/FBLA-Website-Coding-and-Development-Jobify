import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, AppBar, Toolbar, Container, InputBase, Paper, IconButton, Avatar, Link as MuiLink } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="8" fill="#FF6B00" />
      </svg>
    ),
    title: 'For Employers',
    description: 'Easily submit job postings and reach students at your school. Simple, fast, and effective.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" fill="#FF6B00" />
        <rect x="18" y="28" width="12" height="4" rx="2" fill="#fff" />
        <rect x="20" y="18" width="8" height="10" rx="2" fill="#fff" />
      </svg>
    ),
    title: 'For Students',
    description: 'Browse and apply for approved job postings. Find the perfect opportunity for your future.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="24" height="24" rx="6" fill="#FF6B00" />
        <rect x="20" y="20" width="8" height="8" rx="2" fill="#fff" />
        <rect x="16" y="32" width="16" height="4" rx="2" fill="#fff" />
      </svg>
    ),
    title: 'For Admins',
    description: 'Approve or delete postings and manage your school\'s job board with ease.',
  },
];

const testimonials = [
  {
    name: 'Alex Johnson',
    image: '/static/images/testimonial1.jpg',
    quote: 'Jobify helped me find my first internship. The process was easy and the opportunities were amazing!',
    title: 'High School Senior',
  },
  {
    name: 'Maria Chen',
    image: '/static/images/testimonial2.jpg',
    quote: 'I love how simple it is to apply for jobs and connect with employers. Highly recommended for all students!',
    title: 'FBLA Member',
  },
];

const heroSvgVariants = {
  animate: {
    rotate: [0, 10, -10, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.7, type: 'spring' },
  }),
};

const testimonialVariants = {
  hidden: { opacity: 0, y: 80, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.3, duration: 0.9, type: 'spring' },
  }),
};

const testimonialHover = {
  hover: {
    scale: 1.03,
    boxShadow: '0 8px 40px 0 #FF6B00',
    transition: { duration: 0.3 },
  },
};

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/register' },
];

const socialLinks = [
  { icon: <FacebookIcon />, href: 'https://facebook.com', label: 'Facebook' },
  { icon: <TwitterIcon />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <InstagramIcon />, href: 'https://instagram.com', label: 'Instagram' },
  { icon: <LinkedInIcon />, href: 'https://linkedin.com', label: 'LinkedIn' },
];

const Landing = () => {
  const [search, setSearch] = useState('');

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      {/* Gradient Background */}
      <Box
        sx={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          top: 0,
          left: 0,
          background: 'linear-gradient(120deg, #fff 0%, #ffe0c2 40%, #FF6B00 100%)',
        }}
      />
      {/* Navigation Bar */}
      <AppBar position="static" color="default" elevation={0} sx={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)', pt: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF6B00', letterSpacing: 2 }}>
            Jobify
          </Typography>
          <Box>
            <Button color="inherit" sx={{ color: '#222', fontWeight: 600, mr: 2 }} href="#features">Features</Button>
            <Button color="inherit" sx={{ color: '#222', fontWeight: 600, mr: 2 }} href="/login">Login</Button>
            <Button variant="contained" sx={{ background: '#FF6B00', color: '#fff', fontWeight: 600, boxShadow: 2 }} href="/register">Get Started</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ pt: 10, pb: 6, textAlign: 'center' }}>
        <motion.div
          variants={heroSvgVariants}
          animate="animate"
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
        >
          {/* Animated SVG */}
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <Typography variant="h2" sx={{ fontWeight: 800, color: '#222', mb: 2, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
          The Go-To Platform for School Job Boards
        </Typography>
        <Typography variant="h5" sx={{ color: '#444', mb: 4 }}>
          Empowering students, employers, and schools to connect and grow. Discover, post, and manage job opportunities with ease.
        </Typography>
        {/* Search Bar */}
        <Paper
          component="form"
          sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', maxWidth: 400, mx: 'auto', mb: 3, borderRadius: 4, boxShadow: 2 }}
          onSubmit={e => { e.preventDefault(); }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search jobs, companies, or keywords..."
            inputProps={{ 'aria-label': 'search jobs' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px', color: '#FF6B00' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
        <Button variant="contained" size="large" sx={{ background: '#FF6B00', color: '#fff', fontWeight: 700, px: 5, py: 1.5, borderRadius: 8, fontSize: '1.2rem', boxShadow: 3 }} href="/register">
          Get Started
        </Button>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" id="features" sx={{ pb: 10 }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <motion.div
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
              >
                <Card sx={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid #F3F3F3',
                  borderRadius: 4,
                  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.06)',
                  minHeight: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: '0 8px 32px 0 #FF6B00',
                  },
                }}>
                  {feature.icon}
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#FF6B00', fontWeight: 700, mb: 1, textAlign: 'center' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#444', textAlign: 'center' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 6, textAlign: 'center' }}>
          What Students Say
        </Typography>
        <Grid container spacing={6} justifyContent="center" alignItems="stretch">
          {testimonials.map((testimonial, idx) => (
            <Grid item xs={12} md={6} key={testimonial.name}>
              <motion.div
                custom={idx}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.3 }}
                variants={testimonialVariants}
                whileTap={{ scale: 0.98 }}
              >
                <Card sx={{
                  background: 'linear-gradient(120deg, #fff 60%, #ffe0c2 100%)',
                  border: '1px solid #FF6B00',
                  borderRadius: 6,
                  boxShadow: '0 8px 40px 0 rgba(255,107,0,0.10)',
                  minHeight: 340,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  p: { xs: 3, md: 5 },
                  gap: 4,
                  backdropFilter: 'blur(8px)',
                  transition: 'box-shadow 0.3s, transform 0.3s',
                  '&:hover': {
                    boxShadow: '0 12px 48px 0 #FF6B00',
                    transform: 'translateY(-6px) scale(1.03)',
                  },
                }}>
                  <Avatar src={testimonial.image} alt={testimonial.name} sx={{ width: 120, height: 120, mr: { md: 5, xs: 0 }, mb: { xs: 2, md: 0 }, border: '4px solid #FF6B00', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ color: '#222', fontWeight: 500, mb: 2, fontStyle: 'italic', fontSize: '1.25rem', lineHeight: 1.6 }}>
                      "{testimonial.quote}"
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#FF6B00', fontWeight: 700, fontSize: '1.1rem' }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                      {testimonial.title}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ width: '100%', background: '#fff', color: '#222', borderTop: '1px solid #eee', pt: 6, pb: 3, px: { xs: 2, md: 8 }, mt: 8 }} component="footer">
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
              <MuiLink key={link.label} href={link.href} underline="none" sx={{ color: '#222', fontWeight: 500, fontSize: '1.1rem', opacity: 0.85, transition: 'opacity 0.2s', '&:hover': { opacity: 1, color: '#FF6B00' } }}>{link.label}</MuiLink>
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
                  sx={{ color: '#222', transition: 'color 0.2s', '&:hover': { color: '#FF6B00' } }}
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

export default Landing; 