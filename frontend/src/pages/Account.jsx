import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { profileAPI } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../contexts/AuthContext';

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    resume: null,
    gpa: '',
    is_job_provider: false,
    account_holder_name: '',
  });
  const [references, setReferences] = useState([]);
  const [education, setEducation] = useState([]);
  const [newReference, setNewReference] = useState({ name: '', relation: '', contact: '' });
  const [newEducation, setNewEducation] = useState({ school_name: '', graduation_date: '', gpa: '' });
  const [showNewReferenceForm, setShowNewReferenceForm] = useState(false);
  const [showNewEducationForm, setShowNewEducationForm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authLoading && user) {
        try {
          const [profileResponse, referencesResponse, educationResponse] = await Promise.all([
            profileAPI.get(),
            profileAPI.getReferences(),
            profileAPI.getEducation(),
          ]);
          
          console.log(profileResponse,profileResponse?.data);

          const profileData = profileResponse || {};
          const referencesData = Array.isArray(referencesResponse) ? referencesResponse : [];
          const educationData = Array.isArray(educationResponse) ? educationResponse : [];

          setProfile(profileData);
          setReferences(referencesData);
          setEducation(educationData);
          setFormData({
            resume: null,
            is_job_provider: profileData.is_job_provider || false,
          });
          setLoading(false);
        } catch (err) {
          console.error('Error fetching profile data:', err);
          setError('Failed to load profile data');
          setLoading(false);
          setReferences([]);
          setEducation([]);
        }
      } else if (!authLoading && !user) {
        setProfile(null);
        setReferences([]);
        setEducation([]);
        setFormData({ resume: null, gpa: '', is_job_provider: false, account_holder_name: '' });
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleResumeChange = (e) => {
    setFormData({
      ...formData,
      resume: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await profileAPI.update(formDataToSend);
      setSuccess('Profile updated successfully');
      setLoading(false);
    } catch (err) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  const handleAddReference = async () => {
    try {
      const response = await profileAPI.addReference(newReference);
      setReferences([...references, response.data]);
      setNewReference({ name: '', relation: '', contact: '' });
      setSuccess('Reference added successfully');
      setShowNewReferenceForm(false);
    } catch (err) {
      setError('Failed to add reference');
    }
  };

  const handleDeleteReference = async (referenceId) => {
    try {
      await profileAPI.deleteReference(referenceId);
      setReferences(references.filter(ref => ref.id !== referenceId));
      setSuccess('Reference deleted successfully');
    } catch (err) {
      setError('Failed to delete reference');
    }
  };

  const handleAddEducation = async () => {
    try {
      const response = await profileAPI.addEducation(newEducation);
      setEducation([...education, response.data]);
      setNewEducation({ school_name: '', graduation_date: '', gpa: '' });
      setSuccess('Education added successfully');
      setShowNewEducationForm(false);
    } catch (err) {
      setError('Failed to add education');
    }
  };

  const handleDeleteEducation = async (educationId) => {
    try {
      await profileAPI.deleteEducation(educationId);
      setEducation(education.filter(edu => edu.id !== educationId));
      setSuccess('Education deleted successfully');
    } catch (err) {
      setError('Failed to delete education');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              My Account
            </Typography>
            {profile?.user && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">{`${profile.user.first_name} ${profile.user.last_name}`}</Typography>
                <Typography color="textSecondary">{profile.user.email}</Typography>
              </Box>
            )}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload Resume
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                      />
                    </Button>
                    {profile?.resume_url && (
                      <Button
                        variant="text"
                        href={profile.resume_url}
                        target="_blank"
                      >
                        View Current Resume
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* References Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              References
            </Typography>
            <Grid container spacing={3}>
              {references.map((reference) => (
                <Grid item xs={12} md={6} key={reference.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6">{reference.name || 'N/A'}</Typography>
                          <Typography color="textSecondary">{reference.relation || 'N/A'}</Typography>
                          <Typography>{reference.contact || 'N/A'}</Typography>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteReference(reference.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                {!showNewReferenceForm && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewReferenceForm(true)}
                    sx={{ mt: 2 }}
                  >
                    Add New Reference
                  </Button>
                )}
                {showNewReferenceForm && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Add New Reference
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Name"
                          value={newReference.name}
                          onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Relation"
                          value={newReference.relation}
                          onChange={(e) => setNewReference({ ...newReference, relation: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Contact"
                          value={newReference.contact}
                          onChange={(e) => setNewReference({ ...newReference, contact: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddReference}
                        >
                          Save New Reference
                        </Button>
                         <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setShowNewReferenceForm(false)}
                          sx={{ ml: 2 }}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Education Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Education
            </Typography>
            <Grid container spacing={3}>
              {education.map((edu) => (
                <Grid item xs={12} md={6} key={edu.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6">{edu.school_name || 'N/A'}</Typography>
                          <Typography color="textSecondary">
                            Graduated: {edu.graduation_date ? new Date(edu.graduation_date).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography>GPA: {edu.gpa || 'N/A'}</Typography>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteEducation(edu.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                {!showNewEducationForm && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewEducationForm(true)}
                    sx={{ mt: 2 }}
                  >
                    Add New Education
                  </Button>
                )}
                {showNewEducationForm && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Add New Education
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="School Name"
                          value={newEducation.school_name}
                          onChange={(e) => setNewEducation({ ...newEducation, school_name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Graduation Date"
                          type="date"
                          value={newEducation.graduation_date}
                          onChange={(e) => setNewEducation({ ...newEducation, graduation_date: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="GPA"
                          type="number"
                          inputProps={{ step: "0.01", min: "0", max: "4.0" }}
                          value={newEducation.gpa}
                          onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddEducation}
                        >
                          Save New Education
                        </Button>
                         <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setShowNewEducationForm(false)}
                          sx={{ ml: 2 }}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Account; 