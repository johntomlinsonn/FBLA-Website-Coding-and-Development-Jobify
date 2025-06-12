import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, List, ListItem, ListItemText, ListItemIcon, Tabs, Tab, Avatar } from '@mui/material';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AccountCircle, Business, Work, CheckCircleOutline, GroupAdd } from '@mui/icons-material';

const AdminDashboardStats = () => {
  const [dashboardStats, setDashboardStats] = useState({
    total_job_submissions: 0,
    approved_postings: 0,
    monthly_submissions: [],
    job_category_breakdown: [],
    total_student_accounts: 0,
    total_employer_accounts: 0,
    salary_distribution: [],
    average_job_grade: null,
  });
  const [studentStats, setStudentStats] = useState([]);
  const [jobProviderStats, setJobProviderStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSecondaryChart, setCurrentSecondaryChart] = useState(0);
  const [currentAccountStatsTab, setCurrentAccountStatsTab] = useState(0);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/dashboard-stats/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setDashboardStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    const fetchAccountStats = async () => {
      try {
        const studentResponse = await axios.get('/api/admin/student-account-stats/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setStudentStats(studentResponse.data.student_stats);

        const jobProviderResponse = await axios.get('/api/job-post-success-rate/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setJobProviderStats(jobProviderResponse.data.job_provider_stats);

      } catch (err) {
        console.error('Error fetching account stats:', err);
        setError('Failed to load account statistics.');
      }
    };

    fetchDashboardStats();
    fetchAccountStats();
  }, []);

  if (loading) {
    return <Typography>Loading dashboard data...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const statsCards = [
    { label: 'Total Job Submissions', value: dashboardStats.total_job_submissions.toLocaleString(), icon: <Work sx={{ color: '#FF6B00' }} /> },
    { label: 'Approved Postings', value: dashboardStats.approved_postings.toLocaleString(), icon: <CheckCircleOutline sx={{ color: '#4CAF50' }} /> },
    { label: 'Student Accounts', value: dashboardStats.total_student_accounts.toLocaleString(), icon: <AccountCircle sx={{ color: '#3F51B5' }} /> },
    { label: 'Employer Accounts', value: dashboardStats.total_employer_accounts.toLocaleString(), icon: <Business sx={{ color: '#FF9800' }} /> },
  ];

  const PIE_COLORS = ['#FF6B00', '#FF9933', '#FFC166', '#FFA726', '#FF8C00', '#FF7C00', '#FF6A00', '#FF5A00'];
  const BAR_COLORS = '#FF6B00';

  const handleSecondaryChartChange = (event, newValue) => {
    setCurrentSecondaryChart(newValue);
  };

  const handleAccountStatsTabChange = (event, newValue) => {
    setCurrentAccountStatsTab(newValue);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#ffffff', minHeight: '100%', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>
        Admin Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'translateY(-8px)' }, border: '1px solid #eeeeee' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stat.icon}
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.9rem', color: '#555' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: '#222', mt: 0.5 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', height: '100%', border: '1px solid #eeeeee' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#222222' }}>
              Job Submissions per Month
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardStats.monthly_submissions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDashArray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#FF6B00" activeDot={{ r: 8 }} name="Submissions" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', height: '100%', border: '1px solid #eeeeee' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={currentSecondaryChart} onChange={handleSecondaryChartChange} aria-label="secondary chart tabs">
                <Tab label="Job Categories" />
                <Tab label="Salaries" />
                <Tab label="Job Grade Average" />
              </Tabs>
            </Box>

            {currentSecondaryChart === 0 && (
              <React.Fragment>
                <Typography variant="h6" gutterBottom sx={{ color: '#222222' }}>
                  Breakdown by Job Categories
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardStats.job_category_breakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      dataKey="count"
                      nameKey="job_type"
                    >
                      {dashboardStats.job_category_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} jobs`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </React.Fragment>
            )}

            {currentSecondaryChart === 1 && (
              <React.Fragment>
                <Typography variant="h6" gutterBottom sx={{ color: '#222222' }}>
                  Salary Distribution (Hourly)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardStats.salary_distribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDashArray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} jobs`} />
                    <Legend />
                    <Bar dataKey="count" fill={BAR_COLORS} name="Number of Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </React.Fragment>
            )}

            {currentSecondaryChart === 2 && (
              <React.Fragment>
                <Typography variant="h6" gutterBottom sx={{ color: '#222222' }}>
                  Average Job Grade
                </Typography>
                <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: '#FF6B00' }}>
                    {dashboardStats.average_job_grade !== null ? dashboardStats.average_job_grade.toFixed(1) : 'N/A'}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Overall Average Attainability Score
                  </Typography>
                </Box>
              </React.Fragment>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)', border: '1px solid #eeeeee' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={currentAccountStatsTab} onChange={handleAccountStatsTabChange} aria-label="account statistics tabs">
                <Tab label="Student Account Statistics" />
                <Tab label="Job Provider Statistics" />
              </Tabs>
            </Box>

            {currentAccountStatsTab === 0 && (
              <React.Fragment>
                <Typography variant="h6" gutterBottom sx={{ color: '#222222' }}>
                  Student Account Statistics
                </Typography>
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {studentStats.length > 0 ? (studentStats.map((student) => (
                    <ListItem key={student.id} divider>
                      <ListItemIcon>
                        {student.profile_picture ? (
                          <Avatar src={student.profile_picture} alt={student.username} />
                        ) : (
                          <AccountCircle />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={student.username}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              Applications: {student.num_applications} • Favorited Jobs: {student.num_favorited_jobs}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))) : (
                    <Typography sx={{ p: 2 }}>No student statistics available.</Typography>
                  )}
                </List>
              </React.Fragment>
            )}

            {currentAccountStatsTab === 1 && (
              <React.Fragment>
                <Typography variant="h6" gutterBottom sx={{ color: '#222222' }}>
                  Job Provider Statistics
                </Typography>
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {jobProviderStats.length > 0 ? (jobProviderStats.map((provider) => (
                    <ListItem key={provider.id} divider>
                      <ListItemIcon>
                        {provider.profile_picture ? (
                          <Avatar src={provider.profile_picture} alt={provider.username} />
                        ) : (
                          <Business />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={provider.username}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              Job Post Success Rate: {provider.job_post_success_rate !== null ? `${provider.job_post_success_rate.toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))) : (
                    <Typography sx={{ p: 2 }}>No job provider statistics available.</Typography>
                  )}
                </List>
              </React.Fragment>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardStats;
