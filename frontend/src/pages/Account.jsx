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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import { profileAPI } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth, api } from '../contexts/AuthContext';
import ProfileCompletionBar from '../components/ProfileCompletionBar';
import BadgeDisplay from '../components/BadgeDisplay';
import ChallengeWidget from '../components/ChallengeWidget';

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    resume: null,
    profile_picture: null, // Add profile_picture to formData
    gpa: '',
    is_job_provider: false,
    account_holder_name: '',
    skills: [],
    currently_working: false,
  });
  const [references, setReferences] = useState([]);
  const [education, setEducation] = useState([]);
  const [newReference, setNewReference] = useState({ name: '', relation: '', contact: '' });
  const [newEducation, setNewEducation] = useState({ school_name: '', graduation_date: '', gpa: '' });
  const [showNewReferenceForm, setShowNewReferenceForm] = useState(false);
  const [showNewEducationForm, setShowNewEducationForm] = useState(false);
  const [gamification, setGamification] = useState(null);
  const [challenges, setChallenges] = useState([]);

  // Categorized skills list
  const skillCategories = {
    'Academic & Core Skills': [
      'Time Management', 'Study Skills', 'Critical Thinking', 'Problem Solving',
      'Public Speaking', 'Research & Writing', 'Note-Taking', 'Test Preparation',
      'Foreign Language', 'Math Proficiency', 'Scientific Reasoning'
    ],
    'Soft & Interpersonal Skills': [
      'Leadership', 'Teamwork', 'Communication', 'Creativity', 'Adaptability',
      'Organization', 'Conflict Resolution', 'Responsibility', 'Initiative',
      'Empathy', 'Collaboration'
    ],
    'Technical & Computer Skills': [
      'Python Programming', 'Java Programming', 'HTML/CSS', 'JavaScript',
      'Microsoft Excel', 'Google Workspace', 'Graphic Design', 'Video Editing',
      'Coding Fundamentals', 'Website Development', 'Spreadsheets & Data Analysis',
      'App Development'
    ],
    'Career & Project Skills': [
      'Resume Writing', 'Interviewing', 'Event Planning', 'Fundraising',
      'Social Media Management', 'Customer Service', 'Tutoring / Mentoring',
      'Volunteering / Community Engagement', 'Entrepreneurship', 'Marketing Basics'
    ]
  };

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
            profile_picture: null, // Reset profile_picture on fetch
            is_job_provider: profileData.is_job_provider || false,
            account_holder_name: profileData.account_holder_name || '',
            skills: profileData.skills || [],
            currently_working: profileData.currently_working || false,
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
        setFormData({ resume: null, profile_picture: null, gpa: '', is_job_provider: false, account_holder_name: '', currently_working: false }); // Reset profile_picture
        setLoading(false);
      }
    };

    fetchProfile();

    const fetchGamification = async () => {
      try {
        const [profileRes, challengesRes] = await Promise.all([
          api.get('/gamification/profile/'),
          api.get('/gamification/challenges/'),
        ]);
        setGamification(profileRes.data);
        setChallenges(challengesRes.data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchGamification();
  }, [user, authLoading]);

  const handleResumeChange = (e) => {
    setFormData({
      ...formData,
      resume: e.target.files[0],
    });
  };

  const handleProfilePictureChange = (e) => { // Add handler for profile picture
    setFormData({
      ...formData,
      profile_picture: e.target.files[0],
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
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
          if (key === 'currently_working') {
            formDataToSend.append(key, formData[key] ? 'true' : 'false');
          } else if (key !== 'skills') {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      // Append skills array
      formData.skills.forEach(skill => formDataToSend.append('skills', skill));

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
      // The backend returns the reference data directly, not wrapped in a data property
      setReferences([...references, response]);
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
      const addedEducation = await profileAPI.addEducation(newEducation);
      setEducation(prev => {
        // Remove any undefined or malformed entries
        const valid = prev.filter(e => e && e.id != null);
        return [...valid, addedEducation];
      });
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

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return `${firstName[0]}`.toUpperCase();
    }
    if (lastName) {
      return `${lastName[0]}`.toUpperCase();
    }
    return 'U'; // Default User initial
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
            <Grid container spacing={2} justifyContent="space-between" alignItems="flex-start">
              <Grid item xs={12} md>
                <Typography variant="h4" component="h1" gutterBottom>
                  My Account
                </Typography>
                {profile?.user && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{`${profile.user.first_name || ''} ${profile.user.last_name || ''}`.trim()}</Typography>
                    <Typography color="textSecondary">{profile.user.email}</Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md="auto">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: { xs: 2, md: 0 } }}>
                  <label htmlFor="profile-picture-input" style={{ cursor: 'pointer' }}>
                    <Avatar
                      src={formData.profile_picture ? URL.createObjectURL(formData.profile_picture) : profile?.profile_picture_url}
                      alt="Profile Picture"
                      sx={{ width: 100, height: 100, mb: 1, border: '2px solid lightgray' }}
                    >
                      {(!profile?.profile_picture_url && !formData.profile_picture && profile?.user) && getInitials(profile.user.first_name, profile.user.last_name)}
                    </Avatar>
                  </label>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    id="profile-picture-input"
                    onChange={handleProfilePictureChange}
                  />
                   <Button
                      variant="outlined"
                      size="small"
                      component="label"
                      htmlFor="profile-picture-input"
                    >
                      Change Picture
                    </Button>
                </Box>
              </Grid>
            </Grid>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3} sx={{ mt: 1}}>
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
                    {formData.resume && <Typography variant="caption">{formData.resume.name}</Typography>}
                    {(!formData.resume && profile?.resume_url) && (
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="account_holder_name"
                    value={formData.account_holder_name}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                      control={
                          <Switch
                              checked={formData.currently_working}
                              onChange={handleFormChange}
                              name="currently_working"
                              color="primary"
                          />
                      }
                      label="Currently Working"
                  />
                </Grid>
                {/* Save Profile Changes */}
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Skills Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Skills
            </Typography>
            {Object.entries(skillCategories).map(([category, skillsList]) => (
              <Accordion key={category} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {skillsList.map(skill => (
                      !formData.skills.includes(skill) && (
                        <Chip
                          key={skill}
                          label={skill}
                          clickable
                          onClick={() => setFormData({
                            ...formData,
                            skills: [...formData.skills, skill]
                          })}
                          sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        />
                      )
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
            {/* Selected Skills */}
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.map(skill => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => setFormData({
                    ...formData,
                    skills: formData.skills.filter(s => s !== skill)
                  })}
                  color="primary"
                />
              ))}
            </Box>
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
              {education.filter((edu) => edu).map((edu) => (
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