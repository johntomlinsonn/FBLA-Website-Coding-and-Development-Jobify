import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Tabs, Tab, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Collapse, IconButton, TextField } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
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
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      console.log('Raw job data from backend:', response); // Log raw response
      console.log('Job grades:', response.map(job => ({ id: job.id, grade: job.grade }))); // Log just the grades
      setJobs(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setSnackbar({ open: true, message: 'Error fetching jobs', severity: 'error' });
    }
  }, 150)).current; // 150ms delay

  useEffect(() => {
    // Trigger the debounced fetch when statusFilter or searchTerm changes
    debouncedFetchJobs(statusFilter, searchTerm);
  }, [statusFilter, searchTerm, debouncedFetchJobs]); // Add debouncedFetchJobs to dependencies

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
          break;
        default:
          break;
      }
      // After action, re-fetch jobs with current filters
      debouncedFetchJobs(statusFilter, searchTerm);
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
    // Find the job object for logging
    const job = jobs.find(j => j.id === jobId);
    console.log('Clicked row for job:', job);
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Add a function to get grade color
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

  // Add a function to format the grade
  const formatGrade = (grade) => {
    console.log('Formatting grade:', grade, 'Type:', typeof grade);
    if (!grade) return 'N/A';
    return String(grade);
  };

  return (
    <Box sx={{ display: 'flex', p: 3, minHeight: 'calc(100vh - 64px - 100px)' }}>
      <Box sx={{ width: 250, mr: 3, flexShrink: 0, borderRight: '1px solid #eee', pr: 3 }}>
        <Typography variant="h6" gutterBottom>Filter Jobs</Typography>
        <TextField
          label="Search Jobs"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Status</Typography>
        <Tabs
          value={statusFilter}
          onChange={(e, newValue) => setStatusFilter(newValue)}
          orientation="vertical"
          variant="scrollable"
        >
          <Tab label="All Statuses" value="" />
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
          <Tab label="Denied" value="denied" />
        </Tabs>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="admin panel tabs">
            <Tab label="Job Management" />
            <Tab label="Dashboard Stats" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <TableContainer component={Paper} sx={{ borderRadius: '8px' }}>
            <Table aria-label="admin job table">
              <TableHead>
                <TableRow>
                  <TableCell padding="normal" />
                  <TableCell padding="normal">Title</TableCell>
                  <TableCell padding="normal">Company</TableCell>
                  <TableCell padding="normal">Location</TableCell>
                  <TableCell padding="normal">Status</TableCell>
                  <TableCell padding="normal">Grade</TableCell>
                </TableRow>
              </TableHead>
              <AnimatePresence>
                <TableBody>
                  {jobs.map((job) => (
                    <React.Fragment key={job.id}>
                      <motion.tr
                         layout
                         initial="hidden"
                         animate="visible"
                         exit="hidden"
                         variants={rowVariants}
                         transition={{ duration: 0.5 }}
                      >
                        <TableCell padding="normal">
                          <IconButton size="small" onClick={() => handleRowClick(job.id)}>
                            {expandedJobId === job.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="normal">{job.title}</TableCell>
                        <TableCell padding="normal">{job.company_name}</TableCell>
                        <TableCell padding="normal">{job.location}</TableCell>
                        <TableCell padding="normal" sx={{
                          color: job.status === 'pending' ? '#FFA726' :
                                 job.status === 'approved' ? '#66BB6A' :
                                 job.status === 'denied' ? '#EF5350' :
                                 'inherit',
                          fontWeight: 'bold'
                        }}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </TableCell>
                        <TableCell padding="normal" sx={{ fontWeight: 500 }}>
                          <Typography sx={{ color: getGradeColor(job.grade) }}>
                            {formatGrade(job.grade)}
                          </Typography>
                        </TableCell>
                      </motion.tr>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedJobId === job.id} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Details
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Salary: ${job.salary?.toLocaleString() || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Grade: <span style={{ color: getGradeColor(job.grade) }}>{formatGrade(job.grade)}</span>
                              </Typography>
                              <Typography variant="body2">
                                **Description:** {job.description || 'No description provided'}
                              </Typography>
                              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                {job.status !== 'approved' && (
                                  <Button variant="contained" sx={{ bgcolor: '#FF6B00', '&:hover': { bgcolor: '#FF8C00' } }} onClick={() => handleAction(job, 'approve')}>Approve</Button>
                                )}
                                {job.status !== 'denied' && (
                                  <Button variant="outlined" sx={{ color: '#222', borderColor: '#222', '&:hover': { borderColor: '#000' } }} onClick={() => handleAction(job, 'deny')}>Deny</Button>
                                )}
                                <Button variant="outlined" color="error" onClick={() => handleAction(job, 'delete')}>Delete</Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </AnimatePresence>
            </Table>
          </TableContainer>
        )}
        {currentTab === 1 && <AdminDashboardStats />}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          Are you sure you want to {actionType} this job?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmAction} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel; 