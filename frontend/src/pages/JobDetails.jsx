import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobsAPI.getById(id);
        setJob(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}/apply` } });
    } else {
      navigate(`/jobs/${id}/apply`);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Job not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {job.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {job.company_name}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {job.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Typography variant="body1">
            <strong>Salary:</strong> ${job.salary.toLocaleString()}
          </Typography>
          <Typography variant="body1">
            <strong>Grade:</strong> {job.grade}
          </Typography>
          <Typography variant="body1">
            <strong>Posted:</strong>{' '}
            {new Date(job.created_at).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Back to Jobs
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(`/jobs/${id}/edit`)}
          >
            Edit Job
          </Button>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleApply}
            sx={{ px: 4, py: 1.5 }}
          >
            Apply Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default JobDetails; 