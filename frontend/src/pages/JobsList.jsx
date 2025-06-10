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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { favoriteJobsAPI } from '../services/api';

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
    showFavoritedOnly: false,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    jobTypes: [],
    salaryRange: [0, 50],
    companies: [],
    showFavoritedOnly: false,
  });
  const [openFilterModal, setOpenFilterModal] = useState(null);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState({
    jobType: false,
    company: false
  });
  const [allCompanies, setAllCompanies] = useState([]); // Store all companies
  const [sortBy, setSortBy] = useState('recent'); // Add sorting state
  const [favoritedJobIds, setFavoritedJobIds] = useState([]); // State to store favorited job IDs

  // Add debounced filter application
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
    }, 750);

    return () => clearTimeout(timer);
  }, [filters]);

  // Update available companies based on other filters
  useEffect(() => {
    const updateAvailableCompanies = async () => {
      try {
        const params = {
          status: 'approved',
          search: searchTerm,
        };

        if (filters.jobTypes && filters.jobTypes.length > 0) {
          params.job_type = filters.jobTypes;
        }

        if (filters.salaryRange) {
          params.min_salary = filters.salaryRange[0];
          params.max_salary = filters.salaryRange[1];
        }

        const filteredJobs = await jobsAPI.getAll(params);
        const companies = [...new Set(filteredJobs.map(job => job.company_name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        setAvailableCompanies(companies);
      } catch (error) {
        console.error('Error updating available companies:', error);
      }
    };

    updateAvailableCompanies();
  }, [searchTerm, filters.jobTypes, filters.salaryRange]);

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

      if (currentFilters.showFavoritedOnly) {
        params.showFavoritedOnly = true;
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

        // Extract unique values for filters and sort companies alphabetically
        const companies = [...new Set(allApprovedJobs.map(job => job.company_name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        const jobTypes = [...new Set(allApprovedJobs.map(job => job.job_type).filter(Boolean))];

        setAllCompanies(companies); // Store all companies
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

  // Clear company filter when no companies are available
  useEffect(() => {
    if (filters.companies.length > 0) {
      const validCompanies = filters.companies.filter(company => 
        availableCompanies.includes(company)
      );
      if (validCompanies.length !== filters.companies.length) {
        setFilters(prev => ({
          ...prev,
          companies: validCompanies
        }));
      }
    }
  }, [availableCompanies, filters.companies]);

  // Add sorting function
  const sortJobs = (jobs) => {
    const sortedJobs = [...jobs];
    switch (sortBy) {
      case 'recent':
        return sortedJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'salary_high':
        return sortedJobs.sort((a, b) => b.salary - a.salary);
      case 'salary_low':
        return sortedJobs.sort((a, b) => a.salary - b.salary);
      case 'grade_high':
        return sortedJobs.sort((a, b) => (b.grade || 0) - (a.grade || 0));
      case 'grade_low':
        return sortedJobs.sort((a, b) => (a.grade || 0) - (b.grade || 0));
      case 'questions_high':
        return sortedJobs.sort((a, b) => (b.custom_questions?.length || 0) - (a.custom_questions?.length || 0));
      case 'questions_low':
        return sortedJobs.sort((a, b) => (a.custom_questions?.length || 0) - (b.custom_questions?.length || 0));
      default:
        return sortedJobs;
    }
  };

  // Modify the jobs display to use sorted jobs
  const displayJobs = useMemo(() => sortJobs(jobs), [jobs, sortBy]);

  // Effect to fetch favorited jobs on component mount or user change
  useEffect(() => {
    const fetchFavoritedJobs = async () => {
      if (user) {
        try {
          const response = await favoriteJobsAPI.getFavorited();
          setFavoritedJobIds(response.map(job => job.id));
        } catch (err) {
          console.error('Error fetching favorited jobs:', err);
        }
      }
    };

    fetchFavoritedJobs();
  }, [user]); // Re-fetch when user changes (e.g., login/logout)

  // Handle toggling favorite status
  const handleToggleFavorite = async (jobId) => {
    if (!user) {
      navigate('/signin'); // Redirect to login if not authenticated
      return;
    }
    try {
      const response = await favoriteJobsAPI.toggleFavorite(jobId);
      if (response.message.includes('added')) {
        setFavoritedJobIds(prev => [...prev, jobId]);
      } else {
        setFavoritedJobIds(prev => prev.filter(id => id !== jobId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Optionally show a toast notification for the error
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
                {user && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.showFavoritedOnly}
                        onChange={(e) => setFilters(prev => ({ ...prev, showFavoritedOnly: e.target.checked }))}
                        sx={{ color: '#FF6B00' }}
                      />
                    }
                    label="Show Favorited Jobs Only"
                    sx={{ mb: 1, ml: 1 }} // Adjust margin to align with other filters
                  />
                )}
              </Box>

              {/* Apply Filters Button for the main panel */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleApplyFilters}
                sx={{
                  background: '#FF6B00',
                  '&:hover': { background: '#e65c00' },
                  mt: 3,
                }}
              >
                Close Filters
              </Button>

            </Paper>
          </Grid>

          {/* Jobs List */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1">
                Available Jobs
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="recent">Most Recent</MenuItem>
                    <MenuItem value="salary_high">Salary (High to Low)</MenuItem>
                    <MenuItem value="salary_low">Salary (Low to High)</MenuItem>
                    <MenuItem value="grade_high">Grade (High to Low)</MenuItem>
                    <MenuItem value="grade_low">Grade (Low to High)</MenuItem>
                    <MenuItem value="questions_high">Questions (Most to Least)</MenuItem>
                    <MenuItem value="questions_low">Questions (Least to Most)</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  sx={{ background: '#FF6B00', '&:hover': { background: '#e65c00' } }}
                  onClick={() => navigate('/jobs/create')}
                >
                  Post a Job
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {/* Show loading indicator while fetching jobs (after initial load) */}
            {loading && jobs.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && jobs.length === 0 && searchTerm === '' && (
              <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                No jobs found. Try adjusting your filters.
              </Typography>
            )}

                  <Grid container spacing={3}>
              <AnimatePresence mode="wait">
                    {displayJobs.map((job) => (
                  <Grid item key={job.id} xs={12} sm={6} md={4}>
                      <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      variants={jobCardVariants}
                      >
                        <Card
                        elevation={3}
                          sx={{
                          borderRadius: 2,
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
                            display: 'flex',
                            flexDirection: 'column',
                          height: '100%',
                          position: 'relative', // Added for IconButton positioning
                        }}
                      >
                        {user && (
                          <IconButton 
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 1,
                              color: favoritedJobIds.includes(job.id) ? '#FF6B00' : '#000000', // Orange for favorited, Black for not
                            '&:hover': {
                                color: favoritedJobIds.includes(job.id) ? '#e65c00' : '#333333', // Darker orange/black on hover
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click from triggering
                              handleToggleFavorite(job.id);
                            }}
                            aria-label="favorite job"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill={favoritedJobIds.includes(job.id) ? '#FF6B00' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-heart"
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                            </svg>
                          </IconButton>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="div" gutterBottom>
                              {job.title}
                            </Typography>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            {job.company_name} - {job.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {job.job_type} | {job.salary}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              Attainability Grade:
                            </Typography>
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{
                                color: getGradeColor(job.grade),
                                fontWeight: 'bold',
                                border: `1px solid ${getGradeColor(job.grade)}`,
                                borderRadius: '4px',
                                px: 1,
                                py: 0.5,
                              }}
                            >
                              {formatGrade(job.grade)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                            {job.description}
                              </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Posted: {new Date(job.created_at).toLocaleDateString()}
                              </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={() => handleApply(job.id)}
                            sx={{
                              background: '#FF6B00',
                              '&:hover': { background: '#e65c00' },
                            }}
                          >
                            View Details
                          </Button>
                            </Box>
                        </Card>
                      </motion.div>
                  </Grid>
                ))}
                </AnimatePresence>

              {!loading && displayJobs.length === 0 && searchTerm !== '' && (
                <Grid item xs={12}>
                  <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    No jobs found for "{searchTerm}". Try a different search or adjust filters.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Salary Filter Modal */}
      <Modal
          open={openFilterModal === 'hourlyWage'}
          onClose={() => setOpenFilterModal(null)}
          aria-labelledby="salary-range-modal-title"
          aria-describedby="salary-range-modal-description"
        >
          <Box
            sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
              width: 400,
          bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
          borderRadius: 2,
          outline: 'none',
            }}
          >
            <IconButton
              aria-label="close"
              onClick={() => setOpenFilterModal(null)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="salary-range-modal-title" variant="h6" component="h2" gutterBottom>
              Filter by Hourly Wage
            </Typography>
            <Typography id="salary-range-modal-description" gutterBottom>
              Select your desired hourly wage range.
            </Typography>
              <Slider
              getAriaLabel={() => 'Salary range'}
                value={filters.salaryRange}
              onChange={handleSalaryRangeChange}
                valueLabelDisplay="auto"
                min={0}
              max={200}
              step={5}
              marks
              sx={{ color: '#FF6B00' }}
            />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              ${filters.salaryRange[0]} - ${filters.salaryRange[1]} per hour
              </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleApplyFilters}
              sx={{
                background: '#FF6B00',
                '&:hover': { background: '#e65c00' },
                mt: 3,
              }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClearFilter}
              sx={{
                color: '#FF6B00',
                borderColor: '#FF6B00',
                '&:hover': { borderColor: '#e65c00', color: '#e65c00' },
                mt: 1,
              }}
            >
              Clear Filter
            </Button>
        </Box>
      </Modal>
      </Container>
    </Box>
  );
};

export default JobsList; 