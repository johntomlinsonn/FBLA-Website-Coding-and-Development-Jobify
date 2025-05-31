import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Modal,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Add grade color and formatting functions
const getGradeColor = (grade) => {
  if (!grade) return '#757575'; // Gray for N/A
  const numGrade = Number(grade);
  if (numGrade >= 90) return '#4CAF50';      // Green
  if (numGrade >= 80) return '#8BC34A';      // Light Green
  if (numGrade >= 70) return '#FFEB3B';      // Yellow
  if (numGrade >= 60) return '#FF9800';      // Orange
  if (numGrade >= 50) return '#FF5722';      // Deep Orange
  return '#F44336';                          // Red
};

const formatGrade = (grade) => {
  if (!grade) return 'N/A';
  return String(grade);
};

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
    salaryRange: [0, 50],
    companies: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    jobTypes: [],
    salaryRange: [0, 50],
    companies: [],
  });
  const [openFilterModal, setOpenFilterModal] = useState(null);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState({
    jobType: false,
    company: false
  });

  // Memoized fetch function
  const fetchJobs = useMemo(() => debounce(async (currentFilters, currentSearchTerm) => {
    setLoading(true);
    try {
      const params = {
        status: 'approved', // Only show approved jobs
        search: currentSearchTerm,
      };

      if (currentFilters.jobTypes && currentFilters.jobTypes.length > 0) {
        params.job_type = currentFilters.jobTypes;
      }

      if (currentFilters.companies && currentFilters.companies.length > 0) {
        params.company = currentFilters.companies;
      }

      if (currentFilters.salaryRange) {
        params.min_salary = currentFilters.salaryRange[0];
        params.max_salary = currentFilters.salaryRange[1];
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
  }, 300), []); // Empty dependency array means this function is created once

  // Effect to fetch jobs when filters OR search changes
  useEffect(() => {
    // Call the debounced fetch function
    fetchJobs(appliedFilters, searchTerm);

    // Cleanup the debounce timer on unmount
    return () => {
      // This cleanup might not be strictly necessary with useRef but is good practice
      // if debounce implementation changes.
      // clearTimeout(debouncedFetchJobs.current); // This won't work directly with useRef
    };
  }, [appliedFilters, searchTerm, fetchJobs]); // Depend on appliedFilters and searchTerm

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

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setOpenFilterModal(null);
  };

  const handleOpenFilter = (filterType) => {
    if (filterType === 'hourlyWage') {
      setOpenFilterModal(filterType);
    } else {
      setExpandedFilters(prev => ({
        ...prev,
        [filterType]: !prev[filterType]
      }));
    }
  };

  const handleCloseFilterModal = () => {
    setOpenFilterModal(null);
  };

  const handleClearFilter = () => {
    if (openFilterModal === 'hourlyWage') {
      setFilters(prev => ({ ...prev, salaryRange: [0, 50] }));
    } else if (expandedFilters.jobType) {
      setFilters(prev => ({ ...prev, jobTypes: [] }));
    } else if (expandedFilters.company) {
      setFilters(prev => ({ ...prev, companies: [] }));
    }
  };

  const handleApply = (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${jobId}/apply` } });
    } else {
      navigate(`/jobs/${jobId}/apply`);
    }
  };

  // Show initial loading only if no jobs are loaded yet
  if (loading && jobs.length === 0 && searchTerm === '' && filters.jobTypes.length === 0 && filters.companies.length === 0 && filters.salaryRange[0] === 0 && filters.salaryRange[1] === 50) {
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
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='284' height='284' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23E9E4DE' stroke-width='8.7'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3C/g%3E%3Cg fill='%23FF6B00'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3E%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3Ccircle cx='40' cy='599' r='7'/%3E%3Ccircle cx='102' cy='382' r='7'/%3E%3Ccircle cx='127' cy='80' r='7'/%3E%3Ccircle cx='370' cy='105' r='7'/%3E%3Ccircle cx='578' cy='42' r='7'/%3E%3Ccircle cx='237' cy='261' r='7'/%3E%3Ccircle cx='390' cy='382' r='7'/%3E%3C/g%3E%3C/svg%3E")`,
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
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
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
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Filter Categories - Clickable headers */}
              <Box sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    color: appliedFilters.jobTypes.length > 0 ? '#FF6B00' : 'text.primary',
                    fontWeight: appliedFilters.jobTypes.length > 0 ? 'bold' : 'normal',
                  }}
                  onClick={() => handleOpenFilter('jobType')}
                >
                  <Typography variant="subtitle1">Job Type</Typography>
                </Button>
                {expandedFilters.jobType && (
                  <Box sx={{ pl: 2, mt: 1, mb: 2 }}>
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
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Button
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    color: (appliedFilters.salaryRange[0] !== 0 || appliedFilters.salaryRange[1] !== 50) ? '#FF6B00' : 'text.primary',
                    fontWeight: (appliedFilters.salaryRange[0] !== 0 || appliedFilters.salaryRange[1] !== 50) ? 'bold' : 'normal',
                  }}
                  onClick={() => handleOpenFilter('hourlyWage')}
                >
                  <Typography variant="subtitle1">Hourly Wage Range</Typography>
                </Button>
                <Divider sx={{ my: 1 }} />
                <Button
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    color: appliedFilters.companies.length > 0 ? '#FF6B00' : 'text.primary',
                    fontWeight: appliedFilters.companies.length > 0 ? 'bold' : 'normal',
                  }}
                  onClick={() => handleOpenFilter('company')}
                >
                  <Typography variant="subtitle1">Company</Typography>
                </Button>
                {expandedFilters.company && (
                  <Box sx={{ pl: 2, mt: 1, mb: 2 }}>
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
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
              </Box>

              {/* Apply Filters Button for the main panel */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleApplyFilters}
                sx={{
                  background: '#FF6B00',
                  '&:hover': { background: '#e65c00' },
                  mt: 3, // Increased top margin
                }}
              >
                Apply Filters
              </Button>

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
                                Hourly Wage: ${job.salary}/hr
                    </Typography>
                    <Typography variant="body2" sx={{ color: getGradeColor(job.grade), fontWeight: 500 }}>
                      Grade: {formatGrade(job.grade)}
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
    {/* Filter Modal - Only for Hourly Wage Range */}
    <Modal
      open={Boolean(openFilterModal)}
      onClose={handleCloseFilterModal}
      aria-labelledby="filter-modal-title"
      aria-describedby="filter-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 400 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
      }}>
        {/* Modal Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid #eee',
        }}>
          <Typography id="filter-modal-title" variant="h6" component="h2">
            Hourly Wage Range
          </Typography>
          <IconButton onClick={handleCloseFilterModal} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Modal Body - Only Hourly Wage Range */}
        <Box sx={{ p: 2, overflowY: 'auto' }}>
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3, mt: 3 }}>
              <TextField
                size="small"
                label="Min"
                type="number"
                value={filters.salaryRange[0]}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(50, Number(e.target.value)));
                  setFilters(prev => ({
                    ...prev,
                    salaryRange: [value, Math.max(value, prev.salaryRange[1])]
                  }));
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ width: '150px' }}
              />
              <TextField
                size="small"
                label="Max"
                type="number"
                value={filters.salaryRange[1]}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(50, Number(e.target.value)));
                  setFilters(prev => ({
                    ...prev,
                    salaryRange: [Math.min(value, prev.salaryRange[0]), value]
                  }));
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ width: '150px' }}
              />
            </Box>
            <Slider
              value={filters.salaryRange}
              onChange={(event, newValue) => setFilters(prev => ({ ...prev, salaryRange: newValue }))}
              onChangeCommitted={(event, newValue) => setFilters(prev => ({ ...prev, salaryRange: newValue }))}
              valueLabelDisplay="auto"
              min={0}
              max={50}
              step={1}
              sx={{
                width: '80%',
                color: '#FF6B00',
                '& .MuiSlider-thumb': { backgroundColor: '#FF6B00' },
                '& .MuiSlider-track': { backgroundColor: '#FF6B00' },
                '& .MuiSlider-rail': { color: '#ccc' }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
              ${filters.salaryRange[0]}/hr - ${filters.salaryRange[1]}/hr
            </Typography>
          </Box>
        </Box>

        {/* Modal Footer */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2,
          borderTop: '1px solid #eee',
          gap: 1,
        }}>
          <Button onClick={handleClearFilter} sx={{ color: 'text.primary' }}>Clear all</Button>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{ background: '#FF6B00', '&:hover': { background: '#e65c00' }, color: 'white' }}
          >
            Update
          </Button>
        </Box>
      </Box>
    </Modal>
    </Box>
  );
};

export default JobsList; 