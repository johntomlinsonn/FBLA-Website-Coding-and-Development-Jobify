import React, { useState, useEffect } from 'react';
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
  AppBar,
  Toolbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JobsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobTypes: [],
    salaryRange: [0, 200000], // Default to wider range
    companies: [],
    // Add other filter states here
  });
  const [availableCompanies, setAvailableCompanies] = useState([]); // State to store available companies
  const [availableJobTypes, setAvailableJobTypes] = useState([]); // State to store available job types

  // Effect to fetch initial jobs and populate filter options
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all jobs initially to get data for filters
        const allJobsData = await jobsAPI.getAll(); 
        setJobs(allJobsData); // Display all jobs initially

        // Extract unique companies and job types for filters
        const companies = [...new Set(allJobsData.map(job => job.company_name).filter(Boolean))];
        const jobTypes = [...new Set(allJobsData.map(job => job.job_type).filter(Boolean))]; // Assuming 'job_type' field exists
        setAvailableCompanies(companies);
        setAvailableJobTypes(jobTypes);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array to run only once on mount

  // Effect to fetch jobs when filters change (triggered by Apply Filters button)
  const fetchJobsWithFilters = async () => {
     setLoading(true);
     setError(null);
     try {
       const data = await jobsAPI.getAll({ ...filters, searchTerm }); // Pass filters and search term
       setJobs(data);
     } catch (err) {
       setError(err.response?.data?.message || 'Failed to fetch filtered jobs');
     } finally {
       setLoading(false);
     }
  };

  // Handle search from Landing page (optional, now integrated with filters on Apply)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query) {
      setSearchTerm(query);
      // Optionally trigger a search immediately if query is present on initial load
      // fetchJobsWithFilters(); // This might cause double fetch on initial load, depending on how it's called
    }
  }, [location.search]); // Depend on location.search

  // Handle filter changes
  const handleJobTypeChange = (event) => {
    const type = event.target.name;
    setFilters(prevFilters => ({
      ...prevFilters,
      jobTypes: event.target.checked
        ? [...prevFilters.jobTypes, type]
        : prevFilters.jobTypes.filter(t => t !== type),
    }));
  };

  const handleSalaryRangeChange = (event, newValue) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      salaryRange: newValue,
    }));
  };

   const handleCompanyChange = (event) => {
    const company = event.target.name;
    setFilters(prevFilters => ({
      ...prevFilters,
      companies: event.target.checked
        ? [...prevFilters.companies, company]
        : prevFilters.companies.filter(c => c !== company),
    }));
  };

  // Handle Apply Filters button click
  const handleApplyFilters = () => {
    fetchJobsWithFilters(); // Trigger fetching data with current filters
  };

  const handleApply = (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${jobId}/apply` } });
    } else {
      navigate(`/jobs/${jobId}/apply`);
    }
  };

  // Remove frontend filtering since backend handles it now
  // const filteredJobs = jobs.filter(
  //   (job) =>
  //     job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     job.description.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing(2),
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#FFFFFF',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='284' height='284' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23E9E4DE' stroke-width='8.7'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23FF6B00'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3E%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3Ccircle cx='40' cy='599' r='7'/%3E%3Ccircle cx='102' cy='382' r='7'/%3E%3Ccircle cx='127' cy='80' r='7'/%3E%3Ccircle cx='370' cy='105' r='7'/%3E%3Ccircle cx='578' cy='42' r='7'/%3E%3Ccircle cx='237' cy='261' r='7'/%3E%3Ccircle cx='390' cy='382' r='7'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 0,
          }}
        />
        <CircularProgress sx={{ zIndex: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#FFFFFF',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='284' height='284' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23E9E4DE' stroke-width='8.7'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23FF6B00'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3E%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3Ccircle cx='40' cy='599' r='7'/%3E%3Ccircle cx='102' cy='382' r='7'/%3E%3Ccircle cx='127' cy='80' r='7'/%3E%3Ccircle cx='370' cy='105' r='7'/%3E%3Ccircle cx='578' cy='42' r='7'/%3E%3Ccircle cx='237' cy='261' r='7'/%3E%3Ccircle cx='390' cy='382' r='7'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 0,
        }}
      />
      
      {/* Header */}
      <AppBar position="static" color="default" elevation={0} sx={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)', position: 'relative', zIndex: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF6B00', letterSpacing: 2 }}>
            Jobify
          </Typography>
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

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1, height: '100%', overflow: 'auto' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)' }}>
              <Typography variant="h6" gutterBottom>Filter Jobs</Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Job Type</Typography>
                <FormGroup>
                  {availableJobTypes.map(type => (
                     <FormControlLabel
                      key={type}
                      control={ <Checkbox name={type} checked={filters.jobTypes.includes(type)} onChange={handleJobTypeChange} sx={{ color: '#FF6B00' }} />}
                      label={type}
                     />
                  ))}
                </FormGroup>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Salary Range</Typography>
                <Slider
                  value={filters.salaryRange}
                  onChange={handleSalaryRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={200000}
                  sx={{
                      color: '#FF6B00',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#FF6B00',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#FF6B00',
                      },
                      '& .MuiSlider-rail': {
                        color: '#ccc',
                      },
                    }}
                />
                 <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
                </Typography>
              </Box>

               <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Company</Typography>
                  <FormGroup>
                   {availableCompanies.map(company => (
                      <FormControlLabel
                       key={company}
                       control={<Checkbox name={company} checked={filters.companies.includes(company)} onChange={handleCompanyChange} sx={{ color: '#FF6B00' }} />}
                       label={company}
                      />
                   ))}
                  </FormGroup>
               </Box>

               <Button
                variant="contained"
                sx={{ mt: 2, background: '#FF6B00', '&:hover': { background: '#e65c00' } }}
                fullWidth
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Available Jobs
        </Typography>
                 <TextField
                  variant="outlined"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: '300px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
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

            {jobs.length === 0 && !loading && !error ? (
              <Alert severity="info">No jobs found matching criteria.</Alert>
      ) : (
        <Grid container spacing={3}>
                {jobs.map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                         border: '1px solid #eee',
                        borderRadius: 2,
                        boxShadow: 1,
                         backgroundColor: 'rgba(255, 255, 255, 0.8)',
                         backdropFilter: 'blur(5px)',
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
                  <Typography
                          variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
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
            </Grid>
          ))}
        </Grid>
      )}
          </Grid>
        </Grid>
    </Container>
    </Box>
  );
};

export default JobsList; 