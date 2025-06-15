import React, { useState } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Paper
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const FAQ = () => {
  const [expanded, setExpanded] = useState(false)

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const faqs = [
    {
      id: 'panel1',
      question: 'Who can use Jobify?',
      answer: 'Jobify is designed specifically for Normal Community High School students. You must be currently enrolled at NCHS to create an account and apply for jobs through our platform.'
    },
    {
      id: 'panel2',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button on our homepage and provide your NCHS student information, including your student ID. All accounts are verified through the school administration to ensure authenticity.'
    },
    {
      id: 'panel3',
      question: 'What types of jobs are available?',
      answer: 'We feature a variety of part-time positions suitable for high school students, including retail, food service, tutoring, internships, and entry-level office work. All jobs are vetted to ensure they comply with youth employment laws.'
    },
    {
      id: 'panel4',
      question: 'How do I apply for a job?',
      answer: 'Once you find a job that interests you, click "Apply Now" and fill out the application form. You can upload your resume and cover letter, and track your application status through your dashboard.'
    },
    {
      id: 'panel5',
      question: 'Is there a fee to use Jobify?',
      answer: 'No! Jobify is completely free for NCHS students. Our platform is supported by the school and our partner employers who believe in investing in student success.'
    },
    {
      id: 'panel6',
      question: 'How do employers post jobs?',
      answer: 'Employers must first be approved by NCHS administration. Once approved, they can create an account and post job opportunities that are specifically designed for high school students.'
    },
    {
      id: 'panel7',
      question: 'What support is available?',
      answer: 'The NCHS Guidance Department provides support for students using Jobify. You can also contact our support team through the platform or visit the guidance office for help with applications and career advice.'
    },
    {
      id: 'panel8',
      question: 'How are jobs approved?',
      answer: 'All job postings are reviewed by NCHS staff to ensure they meet safety standards, comply with labor laws for minors, and provide meaningful learning experiences for students.'
    }
  ]

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="h5" sx={{ color: '#666', mb: 4 }}>
          Everything you need to know about using Jobify
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {faqs.map((faq) => (
          <Accordion
            key={faq.id}
            expanded={expanded === faq.id}
            onChange={handleChange(faq.id)}
            sx={{
              '&:before': {
                display: 'none',
              },
              '&.Mui-expanded': {
                margin: 0,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#FF6B00' }} />}
              sx={{
                backgroundColor: expanded === faq.id ? '#FFF5F0' : 'transparent',
                '&:hover': {
                  backgroundColor: '#FFF5F0',
                },
                minHeight: 64,
                '&.Mui-expanded': {
                  minHeight: 64,
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '1.1rem',
                }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: '#FAFAFA',
                borderTop: '1px solid #E0E0E0',
                py: 3,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: '#555',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Box sx={{ mt: 6, textAlign: 'center', p: 4, backgroundColor: '#FFF5F0', borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#FF6B00' }}>
          Still have questions?
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
          Contact the NCHS Guidance Department or email us at{' '}
          <strong style={{ color: '#FF6B00' }}>support@jobify.edu</strong>
        </Typography>
      </Box>
    </Container>
  )
}

export default FAQ
