import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'

const About = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>
          Our Mission
        </Typography>
        <Typography variant="h5" sx={{ color: '#666', mb: 4 }}>
          Empowering Normal Community High School students to find their first professional opportunities
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 6, borderRadius: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#FF6B00' }}>
          What We Believe
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.8, mb: 4, color: '#555' }}>
          At Jobify, we believe that every high school student deserves the opportunity to gain real-world work experience. 
          We're dedicated to connecting Normal Community High School Ironmen with local employers who value young talent 
          and are committed to helping students develop essential skills for their future careers.
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#FF6B00' }}>
          Our Approach
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.8, mb: 4, color: '#555' }}>
          Through accessible design, modern tools, and a student-first mindset, we make job searching simple and effective. 
          Our platform is designed specifically for high school students, with features that help you build professional 
          profiles, apply for positions easily, and track your application progress.
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#FF6B00' }}>
          Our Impact
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#555' }}>
          Since our launch, we've helped over 1,500 students connect with meaningful work opportunities, partnered with 
          30+ local businesses, and facilitated 250+ successful job placements. We're proud to be part of the Normal 
          Community High School community and to support the next generation of professionals.
        </Typography>
      </Paper>
    </Container>
  )
}

export default About
