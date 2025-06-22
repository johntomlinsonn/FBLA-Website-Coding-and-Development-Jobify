import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert, 
  Tabs, 
  Tab, 
  TextField,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Stack,
  Badge,
  LinearProgress
} from '@mui/material';
import { 
  KeyboardArrowDown as KeyboardArrowDownIcon, 
  KeyboardArrowUp as KeyboardArrowUpIcon,
  WorkOutline as WorkOutlineIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboardStats from '../components/AdminDashboardStats';

// Simple debounce utility
const debounce = (func, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  // Debounced version of fetchJobs
  const debouncedFetchJobs = useRef(debounce(async (currentStatusFilter, currentSearchTerm) => {
    try {
      const response = await adminAPI.getPendingJobs({
        status: currentStatusFilter,
        search: currentSearchTerm,
      });
      console.log('Raw job data from backend:', response);
      console.log('Job grades:', response.map(job => ({ id: job.id, grade: job.grade })));
      setJobs(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setSnackbar({ open: true, message: 'Error fetching jobs', severity: 'error' });
    }
  }, 150)).current;

  // Fetch all jobs for counting purposes
  const fetchAllJobs = async () => {
    try {
      const response = await adminAPI.getPendingJobs({
        status: '',
        search: '',
      });
      setAllJobs(response);
    } catch (error) {
      console.error('Error fetching all jobs:', error);
    }
  };

  useEffect(() => {
    debouncedFetchJobs(statusFilter, searchTerm);
    fetchAllJobs(); // Fetch all jobs for counting
  }, [statusFilter, searchTerm, debouncedFetchJobs]);

  const handleAction = (job, action) => {
    setSelectedJob(job);
    setActionType(action);
    setOpenDialog(true);
  };

  const confirmAction = async () => {
    try {
      switch (actionType) {
        case 'approve':
          await adminAPI.approveJob(selectedJob.id);
          setSnackbar({ open: true, message: 'Job approved', severity: 'success' });
          break;
        case 'deny':
          await adminAPI.denyJob(selectedJob.id);
          setSnackbar({ open: true, message: 'Job denied', severity: 'success' });
          break;
        case 'delete':
          await adminAPI.deleteJob(selectedJob.id);
          setSnackbar({ open: true, message: 'Job deleted', severity: 'success' });
          break;        default:
          break;
      }
      debouncedFetchJobs(statusFilter, searchTerm);
      fetchAllJobs(); // Refresh all jobs count after action
    } catch (error) {
      console.error(`Error performing ${actionType} action:`, error);
      setSnackbar({ open: true, message: `Error performing ${actionType} action`, severity: 'error' });
    }
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleRowClick = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    console.log('Clicked row for job:', job);
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Get grade color and formatting
  const getGradeColor = (grade) => {
    if (!grade) return '#757575';
    const numGrade = Number(grade);
    if (numGrade >= 90) return '#4CAF50';
    if (numGrade >= 80) return '#8BC34A';
    if (numGrade >= 70) return '#FFEB3B';
    if (numGrade >= 60) return '#FF9800';
    if (numGrade >= 50) return '#FF5722';
    return '#F44336';
  };

  const formatGrade = (grade) => {
    console.log('Formatting grade:', grade, 'Type:', typeof grade);
    if (!grade) return 'N/A';
    return String(grade);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { color: '#4CAF50', bgColor: '#E8F5E8', icon: CheckCircleIcon, label: 'Approved' };
      case 'denied':
        return { color: '#F44336', bgColor: '#FFEBEE', icon: CancelIcon, label: 'Denied' };
      case 'pending':
        return { color: '#FF9800', bgColor: '#FFF3E0', icon: AssessmentIcon, label: 'Pending' };
      default:
        return { color: '#757575', bgColor: '#F5F5F5', icon: WorkOutlineIcon, label: 'Unknown' };
    }
  };
  const getJobCounts = () => {
    const counts = {
      all: allJobs.length,
      pending: allJobs.filter(job => job.status === 'pending').length,
      approved: allJobs.filter(job => job.status === 'approved').length,
      denied: allJobs.filter(job => job.status === 'denied').length
    };
    return counts;
  };

  const jobCounts = getJobCounts();

  // Calculate average grade from all jobs
  const avgGrade = allJobs.length > 0 
    ? Math.round(allJobs.reduce((sum, job) => sum + (Number(job.grade) || 0), 0) / allJobs.length)
    : 0;
  const approvalRate = allJobs.length > 0 
    ? Math.round((jobCounts.approved / allJobs.length) * 100)
    : 0;  // Sort jobs based on selected criteria
  const sortJobs = (jobsToSort) => {
    if (!sortBy) return jobsToSort;

    return [...jobsToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'grade':
          comparison = (Number(b.grade) || 0) - (Number(a.grade) || 0);
          break;
        case 'date':
          comparison = new Date(b.created_at || b.date_posted) - new Date(a.created_at || a.date_posted);
          break;
        case 'questions':
          const aQuestions = Array.isArray(a.custom_questions) ? a.custom_questions.length : 0;
          const bQuestions = Array.isArray(b.custom_questions) ? b.custom_questions.length : 0;
          comparison = bQuestions - aQuestions;
          break;
        default:
          return 0;
      }
      
      // Reverse comparison if ascending order
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  };

  // Handle sort button clicks
  const handleSortClick = (sortType) => {
    if (sortBy === sortType) {
      // Toggle order if same sort type
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // Set new sort type with default descending order
      setSortBy(sortType);
      setSortOrder('desc');
    }
  };

  const sortedJobs = sortJobs(jobs);
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 64px - 100px)',
      bgcolor: 'white',
      gap: 3,
      p: 3
    }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: 280, 
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {/* Quick Stats Cards */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Stats
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 1.5,
                bgcolor: '#FFF8E1',
                borderRadius: 1,
                border: '1px solid #FFE082'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ color: '#FF8F00', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Avg Grade
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#FF8F00', fontWeight: 700 }}>
                  {avgGrade}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 1.5,
                bgcolor: '#E8F5E8',
                borderRadius: 1,
                border: '1px solid #81C784'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Approval Rate
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                  {approvalRate}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Filter Jobs Card */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterListIcon sx={{ color: '#666', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filter Jobs
              </Typography>
            </Box>
            
            <TextField
              placeholder="Search jobs..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#FF6B00',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF6B00',
                  },
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#999', mr: 1, fontSize: 20 }} />
              }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
              Status
            </Typography>
              <Stack spacing={1}>
              {[
                { label: 'All Statuses', value: '', count: jobCounts.all },
                { label: 'Pending', value: 'pending', count: jobCounts.pending },
                { label: 'Approved', value: 'approved', count: jobCounts.approved },
                { label: 'Denied', value: 'denied', count: jobCounts.denied }
              ].map((filter) => (
                <Box
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: statusFilter === filter.value ? '#FF6B00' : 'transparent',
                    color: statusFilter === filter.value ? 'white' : '#333',
                    border: statusFilter === filter.value ? '1px solid #FF6B00' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: statusFilter === filter.value ? '#FF8C00' : '#F5F5F5',
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {filter.label}
                  </Typography>
                  <Chip 
                    label={filter.count} 
                    size="small" 
                    sx={{ 
                      bgcolor: statusFilter === filter.value ? 'rgba(255,255,255,0.2)' : '#E0E0E0',
                      color: statusFilter === filter.value ? 'white' : '#666',
                      fontWeight: 600,
                      minWidth: 24
                    }} 
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Header Tabs */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  color: '#666',
                  '&.Mui-selected': {
                    color: '#FF6B00',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FF6B00',
                  height: 3
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkOutlineIcon fontSize="small" />
                    Job Management
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon fontSize="small" />
                    Dashboard Stats
                  </Box>
                } 
              />
            </Tabs>
          </Box>
        </Card>

        {/* Tab Content */}        {currentTab === 0 && (
          <Box>
            {/* Header Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1 
              }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
                    Job Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage and review job postings
                  </Typography>
                </Box>
                  {/* Quick Sorting */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="Search jobs..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ 
                      width: 250,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#FF6B00',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF6B00',
                        },
                      }
                    }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: '#999', mr: 1, fontSize: 20 }} />
                    }}
                  />                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[
                      { label: 'Grade', value: 'grade', color: '#FF6B00' },
                      { label: 'Date', value: 'date', color: '#2196F3' },
                      { label: 'Questions', value: 'questions', color: '#9C27B0' }
                    ].map((sort) => {
                      const isActive = sortBy === sort.value;
                      const arrow = isActive ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : ' ↓';
                      
                      return (
                        <Chip
                          key={sort.value}
                          label={sort.label + arrow}
                          variant={isActive ? 'filled' : 'outlined'}
                          onClick={() => handleSortClick(sort.value)}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 600,
                            borderColor: sort.color,
                            color: isActive ? 'white' : sort.color,
                            bgcolor: isActive ? sort.color : 'transparent',
                            '&:hover': {
                              bgcolor: isActive ? sort.color : `${sort.color}10`,
                            },
                            transition: 'all 0.2s ease'
                          }}
                        />
                      );
                    })}
                    
                    {/* Clear Sorts Button */}
                    {sortBy && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSortBy('');
                          setSortOrder('desc');
                        }}
                        sx={{
                          ml: 1,
                          color: '#666',
                          borderColor: '#666',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          minWidth: 'auto',
                          px: 2,
                          '&:hover': {
                            borderColor: '#333',
                            bgcolor: '#F5F5F5',
                          },
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>            {/* Job Cards */}
            <Stack spacing={2}>
              <AnimatePresence>
                {sortedJobs.map((job) => {
                  const statusConfig = getStatusConfig(job.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={cardVariants}
                      transition={{ duration: 0.3 }}
                    >
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #E5E7EB',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <CardContent sx={{ p: 0 }}>
                          {/* Main Job Info */}
                          <Box 
                            sx={{ 
                              p: 3,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onClick={() => handleRowClick(job.id)}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                                  {job.title}
                                </Typography>
                                <Chip
                                  icon={<StatusIcon sx={{ fontSize: 16 }} />}
                                  label={statusConfig.label}
                                  sx={{
                                    bgcolor: statusConfig.bgColor,
                                    color: statusConfig.color,
                                    fontWeight: 600,
                                    border: `1px solid ${statusConfig.color}20`
                                  }}
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <WorkOutlineIcon sx={{ color: '#666', fontSize: 16 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {job.company_name}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOnIcon sx={{ color: '#666', fontSize: 16 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {job.location}
                                  </Typography>
                                </Box>
                              </Box>                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Grade:
                                  </Typography>
                                  <Box sx={{
                                    bgcolor: getGradeColor(job.grade) + '20',
                                    color: getGradeColor(job.grade),
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    border: `1px solid ${getGradeColor(job.grade)}40`
                                  }}>
                                    {formatGrade(job.grade)}
                                  </Box>
                                </Box>
                                
                                {/* Show additional sort metric when active */}
                                {sortBy === 'date' && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Posted:
                                    </Typography>
                                    <Box sx={{
                                      bgcolor: '#2196F320',
                                      color: '#2196F3',
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      fontWeight: 600,
                                      fontSize: '0.875rem',
                                      border: '1px solid #2196F340'
                                    }}>
                                      {new Date(job.created_at).toLocaleDateString()}
                                    </Box>
                                  </Box>
                                )}
                                
                                {sortBy === 'questions' && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Questions:
                                    </Typography>
                                    <Box sx={{
                                      bgcolor: '#9C27B020',
                                      color: '#9C27B0',
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      fontWeight: 600,
                                      fontSize: '0.875rem',
                                      border: '1px solid #9C27B040'
                                    }}>
                                      {Array.isArray(job.custom_questions) ? job.custom_questions.length : 0}
                                    </Box>
                                  </Box>
                                )}
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonIcon sx={{ color: '#666', fontSize: 16 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    1 applicant
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton size="small">
                                {expandedJobId === job.id ? 
                                  <KeyboardArrowUpIcon /> : 
                                  <KeyboardArrowDownIcon />
                                }
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Expanded Details */}
                          {expandedJobId === job.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Divider />
                              <Box sx={{ p: 3, bgcolor: '#FAFBFC' }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                  Job Details
                                </Typography>
                                
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AttachMoneyIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                                    <Typography variant="body2" color="text.secondary">
                                      Salary: <strong>${job.salary?.toLocaleString() || 'N/A'}</strong>
                                    </Typography>
                                  </Box>
                                  
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      <strong>Description:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: '#555',
                                      lineHeight: 1.6,
                                      p: 2,
                                      bgcolor: 'white',
                                      borderRadius: 1,
                                      border: '1px solid #E5E7EB'
                                    }}>
                                      {job.description || 'No description provided'}
                                    </Typography>
                                  </Box>
                                </Stack>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {job.status !== 'approved' && (
                                    <Button 
                                      variant="contained" 
                                      startIcon={<CheckCircleIcon />}
                                      onClick={() => handleAction(job, 'approve')}
                                      sx={{ 
                                        bgcolor: '#4CAF50',
                                        '&:hover': { bgcolor: '#45A049' },
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                      }}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {job.status !== 'denied' && (
                                    <Button 
                                      variant="outlined" 
                                      startIcon={<CancelIcon />}
                                      onClick={() => handleAction(job, 'deny')}
                                      sx={{ 
                                        color: '#666',
                                        borderColor: '#666',
                                        '&:hover': { borderColor: '#333', bgcolor: '#F5F5F5' },
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                      }}
                                    >
                                      Deny
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleAction(job, 'delete')}
                                    sx={{ 
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      fontWeight: 600
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </Box>
                              </Box>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Stack>
          </Box>
        )}
        
        {currentTab === 1 && <AdminDashboardStats />}
      </Box>

      {/* Dialogs and Snackbars */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 400 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType} this job?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmAction} 
            variant="contained"
            sx={{ 
              bgcolor: '#FF6B00',
              '&:hover': { bgcolor: '#FF8C00' },
              textTransform: 'none'
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;