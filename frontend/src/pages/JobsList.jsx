import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Slider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Debounce utility
const debounce = (func, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const JobsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  
  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobTypes: [],
    salaryRange: [0, 200000],
    companies: [],
  });
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]);

  // Debounced fetch function - will be called when search or filters change
  const debouncedFetchJobs = useRef(debounce(async (currentFilters, currentSearchTerm) => {
    setLoading(true);
    try {
      // Construct parameters object for the API call
      const params = {
        status: 'approved', // Only show approved jobs
        search: currentSearchTerm,
      };

      // Add job type filter parameters
      if (currentFilters.jobTypes && currentFilters.jobTypes.length > 0) {
        // Ensure jobTypes is an array for the backend
        // The api.get function handles converting array values to multiple params
        params.job_type = currentFilters.jobTypes; 
      }

      // Add company filter parameters
      if (currentFilters.companies && currentFilters.companies.length > 0) {
         // Ensure companies is an array for the backend
         params.company = currentFilters.companies;
      }

      const response = await jobsAPI.getAll(params);

      setJobs(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, 300)).current;

  // Effect to fetch jobs when filters OR search changes
  useEffect(() => {
    // Call the debounced fetch function
    debouncedFetchJobs(filters, searchTerm);

    // Cleanup the debounce timer on unmount
    return () => {
      // This cleanup might not be strictly necessary with useRef but is good practice
      // if debounce implementation changes.
      // clearTimeout(debouncedFetchJobs.current); // This won't work directly with useRef
    };
  }, [filters, searchTerm, debouncedFetchJobs]); // Depend on filters AND searchTerm

  // Initial data fetch (for populating filter options)
  useEffect(() => {
    const fetchInitialFilterData = async () => {
      try {
        // Fetch all approved jobs initially to get available filter options
        const allApprovedJobs = await jobsAPI.getAll({ status: 'approved' });

        // Extract unique values for filters
        const companies = [...new Set(allApprovedJobs.map(job => job.company_name).filter(Boolean))];
        const jobTypes = [...new Set(allApprovedJobs.map(job => job.job_type).filter(Boolean))];

        setAvailableCompanies(companies);
        setAvailableJobTypes(jobTypes);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        // Optionally set an error for filter data fetch
      }
    };

    fetchInitialFilterData();
  }, []); // Run only once on mount

  // Handle search from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [location.search]); // Depend on location.search

  // Filter handlers - These only update state, the useEffect triggers the fetch
  const handleJobTypeChange = (event) => {
    const type = event.target.name;
    setFilters(prev => ({
      ...prev,
      jobTypes: event.target.checked
        ? [...prev.jobTypes, type]
        : prev.jobTypes.filter(t => t !== type)
    }));
  };

  const handleSalaryRangeChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      salaryRange: newValue
    }));
  };

  const handleCompanyChange = (event) => {
    const company = event.target.name;
    setFilters(prev => ({
      ...prev,
      companies: event.target.checked
        ? [...prev.companies, company]
        : prev.companies.filter(c => c !== company)
    }));
  };

  const handleApply = (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${jobId}/apply` } });
    } else {
      navigate(`/jobs/${jobId}/apply`);
    }
  };

  // Show initial loading only if no jobs are loaded yet
  if (loading && jobs.length === 0 && searchTerm === '' && filters.jobTypes.length === 0 && filters.companies.length === 0 && filters.salaryRange[0] === 0 && filters.salaryRange[1] === 200000) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Define animation variants for job cards
  const jobCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        // --- Background image styles from CreateJob.jsx ---
        backgroundColor: '#FFFFFF',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='284' height='284' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23E9E4DE' stroke-width='8.7'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3C/g%3E%3Cg fill='%23FF6B00'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3Ccircle cx='40' cy='599' r='7'/%3E%3Ccircle cx='102' cy='382' r='7'/%3E%3Ccircle cx='127' cy='80' r='7'/%3E%3Ccircle cx='370' cy='105' r='7'/%3E%3Ccircle cx='578' cy='42' r='7'/%3E%3Ccircle cx='237' cy='261' r='7'/%3E%3Ccircle cx='390' cy='382' r='7'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        // ------------------------------------------
      }}
    >
      {/* --- Backdrop layer from CreateJob.jsx ---
      This creates the semi-transparent overlay and blur effect
      It needs to be positioned fixed and have a lower z-index than content
      */}
       <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Adjust opacity as needed
          backdropFilter: 'blur(10px)', // Adjust blur amount as needed
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 0, // Ensure it's behind the content
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>{/* Ensure content is above backdrop */}
        <Grid container spacing={4}>
          {/* Filters Panel */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <Typography variant="h6" gutterBottom>Filter Jobs</Typography>
              <Divider sx={{ my: 2 }} />

              {/* Search Field - This will trigger search via useEffect */}
              <TextField
                label="Search Jobs"
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Job Type Filters */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Job Type</Typography>
                <FormGroup>
                  {availableJobTypes.map(type => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Checkbox
                          name={type}
                          checked={filters.jobTypes.includes(type)}
                          onChange={handleJobTypeChange}
                          sx={{ color: '#FF6B00' }}
                        />
                      }
                      label={type}
                    />
                  ))}
                </FormGroup>
              </Box>

              {/* Salary Range Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Salary Range</Typography>
                <Slider
                  value={filters.salaryRange}
                  onChangeCommitted={(event, newValue) => setFilters(prev => ({ ...prev, salaryRange: newValue }))} // Use onChangeCommitted for better performance on slider
                  valueLabelDisplay="auto"
                  min={0}
                  max={200000}
                  sx={{
                    color: '#FF6B00',
                    '& .MuiSlider-thumb': { backgroundColor: '#FF6B00' },
                    '& .MuiSlider-track': { backgroundColor: '#FF6B00' },
                    '& .MuiSlider-rail': { color: '#ccc' }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
                </Typography>
              </Box>

              {/* Company Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Company</Typography>
                <FormGroup>
                  {availableCompanies.map(company => (
                    <FormControlLabel
                      key={company}
                      control={
                        <Checkbox
                          name={company}
                          checked={filters.companies.includes(company)}
                          onChange={handleCompanyChange}
                          sx={{ color: '#FF6B00' }}
                        />
                      }
                      label={company}
                    />
                  ))}
                </FormGroup>
              </Box>

              {/* Removed Apply Filters Button - Filters apply automatically */}

            </Paper>
          </Grid>

          {/* Jobs List */}
          <Grid item xs={12} md={9}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Available Jobs
        </Typography>
        <Button
          variant="contained"
                sx={{ background: '#FF6B00', '&:hover': { background: '#e65c00' } }}
          onClick={() => navigate('/jobs/create')}
        >
          Post a Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

            {/* Show loading indicator while fetching jobs (after initial load) */}
            {loading && jobs.length > 0 ? (
               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '20vh' }}>
                <CircularProgress />
              </Box>
            ) : (
              jobs.length === 0 ? (
                <Alert severity="info">No jobs found matching your criteria.</Alert>
              ) : (
                <AnimatePresence>
        <Grid container spacing={3}>
                    {jobs.map((job) => (
                      <motion.div
                        key={job.id}
                        variants={jobCardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        item xs={12} sm={6} md={4}
                        sx={{ display: 'flex' }}
                      >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                            border: '1px solid #eee',
                            borderRadius: 2,
                            boxShadow: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    boxShadow: 6,
                    cursor: 'pointer',
                              transform: 'translateY(-4px)',
                              transition: 'transform 0.2s ease-in-out',
                  },
                }}
                          onClick={() => handleApply(job.id)}
              >
                <CardContent>
                            <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#222' }}>
                    {job.title}
                  </Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {job.company_name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                                mb: 2,
                    }}
                  >
                    {job.description}
                  </Typography>
                            <Box sx={{ mt: 'auto' }}>
                              <Typography variant="body2" sx={{ color: '#FF6B00', fontWeight: 600 }}>
                                Salary: ${job.salary.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Grade: {job.grade}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
                      </motion.div>
                    ))}
                  </Grid>
                </AnimatePresence>
              )
            )}
            </Grid>
        </Grid>
    </Container>
    </Box>
  );
};

export default JobsList; 