import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, Container, InputBase, Paper, IconButton, Avatar, Link as MuiLink } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const features = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="8" fill="white" />
        <rect x="16" y="16" width="16" height="16" rx="4" fill="#FF6B00" />
      </svg>
    ),
    title: 'For Employers',
    description: 'Easily submit job postings and reach students at your school. Simple, fast, and effective.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" fill="white" />
        <rect x="18" y="28" width="12" height="4" rx="2" fill="#FF6B00" />
        <rect x="20" y="18" width="8" height="10" rx="2" fill="#FF6B00" />
      </svg>
    ),
    title: 'For Students',
    description: 'Browse and apply for approved job postings. Find the perfect opportunity for your future.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="24" height="24" rx="6" fill="white" />
        <rect x="20" y="20" width="8" height="8" rx="2" fill="#FF6B00" />
        <rect x="16" y="32" width="16" height="4" rx="2" fill="#FF6B00" />
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
    boxShadow: '0 8px 40px 0 rgba(255,107,0,0.5)',
    transition: { duration: 0.3 },
  },
};

const combinedTestimonialVariants = (i) => ({
  hidden: testimonialVariants.hidden,
  visible: testimonialVariants.visible(i),
  hover: testimonialHover.hover
});

const Landing = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = (e) => {
    e.preventDefault();
      navigate(`/jobs?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      display: 'flex', 
      flexDirection: 'column', 
    }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #fff 0%, #ffe0c2 40%, #FF6B00 100%)',
          py: { xs: 10, md: 15 },
          px: { xs: 2, md: 0 },
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        <motion.div
          variants={heroSvgVariants}
          animate="animate"
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF6B00" />
                <stop offset="1" stopColor="#FFD6B0" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" fill="url(#orangeGrad)" />
              <rect x="35" y="35" width="50" height="50" rx="12" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
              <rect x="50" y="50" width="20" height="20" rx="5" fill="white" />
          </svg>
          </motion.div>

          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#222',
              mb: 2,
            }}
          >
            The Go-To Platform for<br/>School Job Boards
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              color: '#444',
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              opacity: 0.9,
            }}
          >
            Empowering students, employers, and schools to connect and grow.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}
        >
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 600,
              margin: '0 auto',
              borderRadius: '12px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              height: 56,
            }}
        >
          <InputBase
              sx={{
                ml: 3,
                flex: 1,
                fontSize: '1.1rem',
                color: '#222',
              }}
              placeholder="Search job titles, companies, or keywords"
            inputProps={{ 'aria-label': 'search jobs' }}
            value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
            <IconButton 
              type="submit" 
              sx={{
                 p: '12px',
                 bgcolor: '#FF6B00',
                 color: '#fff',
                 borderRadius: '0 12px 12px 0',
                 height: '100%',
                 '&:hover': { bgcolor: '#E65C00' }
              }}
              aria-label="search"
            >
            <SearchIcon />
          </IconButton>
          </Box>
        </motion.div>

         {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ marginTop: theme.spacing(4) }}
          >
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: '#FF6B00',
                color: 'white',
                fontWeight: 700, 
                px: 4, 
                py: 1.5, 
                borderRadius: '8px', 
                fontSize: '1.1rem', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                '&:hover': { bgcolor: '#E65C00' } 
              }} 
              onClick={() => navigate('/signup')}>
            Get Started
          </Button>
          </motion.div>
         )}

        <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
              <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
              >
            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, mb: 6, color: '#222' }}>
              Why Jobify?
            </Typography>
          </motion.div>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title} >
                <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} custom={index}>
                  <Card
                    sx={{
                  display: 'flex',
                  flexDirection: 'column',
                      height: '100%',
                      bgcolor: '#fff',
                      color: '#222',
                      borderRadius: '16px',
                      border: '1px solid #eee',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 3, md: 5 } }}>
                       <Box sx={{
                         display: 'flex',
                         justifyContent: 'center',
                  alignItems: 'center',
                         mb: 4,
                         width: 64,
                         height: 64,
                         borderRadius: '50%',
                         bgcolor: '#FF6B00',
                         mx: 'auto',
                         boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}>
                         {React.cloneElement(feature.icon, { width: 40, height: 40, style: { color: '#fff' } })}
                       </Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1.5, color: '#222' }}>
                      {feature.title}
                    </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ color: '#555', lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

        <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, mb: 6, color: '#222' }}>
              What Users Say
        </Typography>
          </motion.div>
          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={testimonial.name}>
              <motion.div
                  variants={combinedTestimonialVariants(index)}
                initial="hidden"
                whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                whileHover="hover"
              >
                <Card sx={{
                  display: 'flex',
                    flexDirection: 'column', 
                    height: '100%', 
                    bgcolor: '#fff',
                    color: '#222',
                    borderRadius: '16px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #eee',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                    }
                }}>
                    <CardContent sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
                       <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                         <FormatQuoteIcon sx={{ fontSize: 64, color: '#FF6B00' }} />
                       </Box>
                      <Typography variant="body1" fontStyle="italic" mb={2.5} sx={{ color: '#444', lineHeight: 1.6 }}>
                      "{testimonial.quote}"
                    </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                        <Avatar src={testimonial.image} alt={testimonial.name} sx={{ mr: 2, border: '2px solid #FF6B00' }}/>
                        <Box textAlign="left">
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222' }}>
                      {testimonial.name}
                    </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ color: '#555' }}>
                      {testimonial.title}
                    </Typography>
                  </Box>
                      </Box>
                    </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 