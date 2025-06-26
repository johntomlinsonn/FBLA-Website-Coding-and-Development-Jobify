import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Grid,
    CircularProgress,
    Alert,
    Paper,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicantCard from '../components/ApplicantCard';
import { api } from '../contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FilterListIcon from '@mui/icons-material/FilterList';

const FindApplicantsPage = () => {
    const [allApplicants, setAllApplicants] = useState([]); // Store all applicants
    const [filteredApplicants, setFilteredApplicants] = useState([]); // Store filtered results
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        skill: 'All Skills',
        position: 'All Positions',
        sortBy: 'Most Recent',
        searchTerm: '',
        quickFilter: '',
    });

    const [stats, setStats] = useState({ activeStudents: 2847, thisWeek: 127 });
    const [availableSkills, setAvailableSkills] = useState([]);
    const [availableJobs, setAvailableJobs] = useState([]);

    const activeFilterStyle = {
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: '1.5px',
        },
        backgroundColor: 'rgba(255, 107, 0, 0.05)'
    };

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all applicants without filters (except maybe initial load optimizations)
            const response = await api.get('/applicants/');
            setAllApplicants(response.data.applicants);
            
            // Extract unique skills and jobs from applicants
            extractFilterOptions(response.data.applicants);
            
            // In a real app, you'd fetch these stats from an API
            // setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching applicants:', error);
            setError(error.response?.data?.error || 'Failed to fetch applicants');
        } finally {
            setLoading(false);
        }
    };

    // Extract unique skills and jobs from applicants data
    const extractFilterOptions = (applicants) => {
        console.log('Extracting filter options from:', applicants.length, 'applicants');
        console.log('Sample applicant data:', applicants[0]); // Debug: show first applicant structure
        
        // Extract unique skills
        const skillsSet = new Set();
        applicants.forEach(applicant => {
            console.log('Applicant skills:', applicant.skills); // Debug: log each applicant's skills
            if (applicant.skills && Array.isArray(applicant.skills)) {
                applicant.skills.forEach(skill => {
                    // Skills are serialized as strings (slug field), not objects
                    if (typeof skill === 'string' && skill.trim()) {
                        skillsSet.add(skill);
                    } else if (skill && skill.name) {
                        // Fallback in case they're objects
                        skillsSet.add(skill.name);
                    }
                });
            }
        });
        const uniqueSkills = Array.from(skillsSet).sort();
        console.log('Extracted skills:', uniqueSkills);
        setAvailableSkills(uniqueSkills);

        // Extract unique jobs
        const jobsSet = new Set();
        applicants.forEach(applicant => {
            if (applicant.applied_jobs && Array.isArray(applicant.applied_jobs)) {
                applicant.applied_jobs.forEach(job => {
                    if (job && job.trim()) {
                        jobsSet.add(job);
                    }
                });
            }
        });
        const uniqueJobs = Array.from(jobsSet).sort();
        console.log('Extracted jobs:', uniqueJobs);
        setAvailableJobs(uniqueJobs);
    };

    // Frontend filtering function
    const applyFilters = () => {
        let filtered = [...allApplicants];
        
        console.log('Applying filters:', filters);
        console.log('Total applicants:', filtered.length);

        // Apply skill filter
        if (filters.skill && filters.skill !== 'All Skills') {
            filtered = filtered.filter(applicant => {
                if (!applicant.skills || !Array.isArray(applicant.skills)) return false;
                
                // Skills are strings (slug field), not objects
                return applicant.skills.some(skill => {
                    if (typeof skill === 'string') {
                        return skill === filters.skill;
                    } else if (skill && skill.name) {
                        // Fallback in case they're objects
                        return skill.name === filters.skill;
                    }
                    return false;
                });
            });
            console.log('After skill filter:', filtered.length);
        }

        // Apply position filter
        if (filters.position && filters.position !== 'All Positions') {
            filtered = filtered.filter(applicant => 
                applicant.applied_jobs && applicant.applied_jobs.some(job => 
                    job === filters.position
                )
            );
            console.log('After position filter:', filtered.length);
        }

        // Apply search term filter
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(applicant => {
                const name = `${applicant.user?.first_name || ''} ${applicant.user?.last_name || ''}`.toLowerCase();
                const location = (applicant.location || '').toLowerCase();
                
                // Handle skills as strings (slug field) or objects
                let skills = '';
                if (applicant.skills && Array.isArray(applicant.skills)) {
                    skills = applicant.skills.map(skill => {
                        if (typeof skill === 'string') {
                            return skill.toLowerCase();
                        } else if (skill && skill.name) {
                            return skill.name.toLowerCase();
                        }
                        return '';
                    }).join(' ');
                }
                
                return name.includes(searchTerm) || 
                       location.includes(searchTerm) || 
                       skills.includes(searchTerm);
            });
            console.log('After search filter:', filtered.length);
        }

        // Apply quick filters
        if (filters.quickFilter) {
            switch (filters.quickFilter) {
                case 'Available Now':
                    // Filter for students who are not currently working or are available
                    filtered = filtered.filter(applicant => !applicant.currently_working);
                    break;
                case 'High GPA (3.5+)':
                    filtered = filtered.filter(applicant => 
                        applicant.gpa && parseFloat(applicant.gpa) >= 3.5
                    );
                    break;
                case 'Multiple Skills':
                    filtered = filtered.filter(applicant => 
                        applicant.skills && applicant.skills.length > 1
                    );
                    break;
                case 'Recent Applicants':
                    // Filter for applicants who joined recently (within last 30 days)
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    filtered = filtered.filter(applicant => {
                        const joinDate = new Date(applicant.user?.date_joined || '');
                        return joinDate >= thirtyDaysAgo;
                    });
                    break;
                default:
                    break;
            }
            console.log('After quick filter:', filtered.length);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'gpa_high_to_low':
                filtered.sort((a, b) => {
                    const gpaA = parseFloat(a.gpa) || 0;
                    const gpaB = parseFloat(b.gpa) || 0;
                    return gpaB - gpaA;
                });
                break;
            case 'gpa_low_to_high':
                filtered.sort((a, b) => {
                    const gpaA = parseFloat(a.gpa) || 0;
                    const gpaB = parseFloat(b.gpa) || 0;
                    return gpaA - gpaB;
                });
                break;
            case 'Most Recent':
            default:
                filtered.sort((a, b) => {
                    const dateA = new Date(a.user?.date_joined || '');
                    const dateB = new Date(b.user?.date_joined || '');
                    return dateB - dateA;
                });
                break;
        }

        console.log('Final filtered count:', filtered.length);
        setFilteredApplicants(filtered);
    };

    // Initial fetch of all applicants
    useEffect(() => {
        fetchApplicants();
    }, []);

    // Set initial filtered applicants when allApplicants loads
    useEffect(() => {
        if (allApplicants.length > 0 && filteredApplicants.length === 0) {
            setFilteredApplicants(allApplicants);
        }
    }, [allApplicants]);

    // Apply filters whenever filters change or allApplicants change
    // Add debounce for search term to improve performance
    useEffect(() => {
        if (allApplicants.length > 0) {
            const handler = setTimeout(() => {
                applyFilters();
            }, filters.searchTerm ? 300 : 0); // Debounce search, instant for other filters
            
            return () => clearTimeout(handler);
        }
    }, [filters, allApplicants]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const handleQuickFilter = (type) => {
        // Toggle behavior
        if (filters.quickFilter === type) {
            handleFilterChange('quickFilter', ''); // Deactivate if already active
        } else {
            handleFilterChange('quickFilter', type); // Activate new filter
        }
    }

    const isQuickFilterActive = (qf) => {
        return filters.quickFilter === qf;
    }

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
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            <Box sx={{
                bgcolor: '#ff6b00',
                color: 'white',
                p: { xs: 2, md: 4 },
                borderRadius: '20px',
            }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                                Find Applicants
                            </Typography>
                            <Typography variant="h6" component="p" sx={{ opacity: 0.9 }}>
                                Discover talented high school students ready to make an impact
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1, minWidth: 150, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <PeopleAltIcon sx={{ color: 'white' }} />
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>{stats.activeStudents.toLocaleString()}</Typography>
                                        <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>Active Students</Typography>
                                    </Box>
                                </Paper>
                                <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1, minWidth: 150, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <TrendingUpIcon sx={{ color: 'white' }} />
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>+{stats.thisWeek}</Typography>
                                        <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>This Week</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                    <TextField
                        fullWidth
                        placeholder="Search by name, location, or skills..."
                        variant="outlined"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'white' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            mt: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                '& fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white',
                                },
                                '& input': {
                                    color: 'white',
                                },
                                '& input::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }
                            },
                        }}
                    />
                </motion.div>
            </Box>

            <Paper elevation={2} sx={{ p: 3, my: 4, borderRadius: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Filter & Sort</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Filter by Skill</InputLabel>
                            <Select
                                value={filters.skill}
                                onChange={(e) => handleFilterChange('skill', e.target.value)}
                                label="Filter by Skill"
                                sx={filters.skill !== 'All Skills' ? activeFilterStyle : {}}
                            >
                                <MenuItem value="All Skills">All Skills</MenuItem>
                                {availableSkills.map((skill) => (
                                    <MenuItem key={skill} value={skill}>
                                        {skill}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                     <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Filter by Position</InputLabel>
                            <Select
                                value={filters.position}
                                onChange={(e) => handleFilterChange('position', e.target.value)}
                                label="Filter by Position"
                                sx={filters.position !== 'All Positions' ? activeFilterStyle : {}}
                            >
                                <MenuItem value="All Positions">All Positions</MenuItem>
                                {availableJobs.map((job) => (
                                    <MenuItem key={job} value={job}>
                                        {job}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                label="Sort By"
                                sx={filters.sortBy !== 'Most Recent' ? activeFilterStyle : {}}
                            >
                                <MenuItem value="Most Recent">Most Recent</MenuItem>
                                <MenuItem value="gpa_high_to_low">GPA (High to Low)</MenuItem>
                                <MenuItem value="gpa_low_to_high">GPA (Low to High)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{alignSelf: 'center', mr: 1, fontWeight: 500, color: 'text.secondary'}}>Quick filters:</Typography>
                    {['Available Now', 'High GPA (3.5+)', 'Multiple Skills', 'Recent Applicants'].map(qf => (
                        <Chip 
                            key={qf} 
                            label={qf} 
                            onClick={() => handleQuickFilter(qf)} 
                            variant="outlined" 
                            sx={{
                                cursor: 'pointer',
                                ...(isQuickFilterActive(qf) && {
                                    bgcolor: 'rgba(255, 107, 0, 0.08)', 
                                    color: 'primary.dark',
                                    fontWeight: 'bold',
                                    borderColor: 'primary.main',
                                })
                            }}
                        />
                    ))}
                </Box>
            </Paper>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {loading ? 'Searching...' : `${filteredApplicants.length} Talented Students Found`}
                </Typography>
                    <Button variant="text" size="small">Showing best matches</Button>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
                    {filteredApplicants.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                No applicants found matching your criteria
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            <AnimatePresence>
                                {filteredApplicants.map((applicant) => (
                                    <Grid item xs={12} sm={6} md={4} key={applicant.id}>
                                        <ApplicantCard applicant={applicant} />
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>
                    )}
                </motion.div>
            )}
        </Box>
    );
};

export default FindApplicantsPage;