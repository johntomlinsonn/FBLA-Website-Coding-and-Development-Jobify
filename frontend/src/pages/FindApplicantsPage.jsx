import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicantCard from '../components/ApplicantCard';
import { api } from '../contexts/AuthContext';

const FindApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    skill: '',
    job: '',
    sortBy: 'recent',
  });

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.job) params.append('job', filters.job);
      if (filters.sortBy) params.append('sort_by', filters.sortBy);

      const response = await api.get(`/applicants/?${params.toString()}`);
      setApplicants(response.data.applicants);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError(error.response?.data?.error || 'Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [filters]); // Refetch when filters change

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Find Applicants
        </Typography>

        {/* Filters Section */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Filter by Skill"
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Filter by Job"
                value={filters.job}
                onChange={(e) => setFilters({ ...filters, job: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="alphabetical">Alphabetical</MenuItem>
                  <MenuItem value="gpa_high_to_low">GPA (High to Low)</MenuItem>
                  <MenuItem value="gpa_low_to_high">GPA (Low to High)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Applicants Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#FF6B00' }} />
          </Box>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {applicants.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No applicants found matching your criteria
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {applicants.map((applicant) => (
                    <Grid item xs={12} sm={6} md={4} key={applicant.id}>
                      <ApplicantCard applicant={applicant} />
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            )}
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

export default FindApplicantsPage;