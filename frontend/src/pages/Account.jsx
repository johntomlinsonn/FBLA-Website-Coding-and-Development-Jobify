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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ComputerIcon from '@mui/icons-material/Computer';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PersonIcon from '@mui/icons-material/Person';
import AccessibilitySettings from '../components/AccessibilitySettings';
import ResumeBuilderWizard from '../components/ResumeBuilder';

const orange = '#FF9100';
const lightOrange = '#FFF7ED';
const darkOrange = '#FF6D00';
const softShadow = '0 4px 24px 0 rgba(255, 145, 0, 0.08)';
const green = '#22C55E';
const purple = '#6366F1';

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
  const [accessOpen, setAccessOpen] = useState(false);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);

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
        if (formData[key] !== null && key !== 'skills') {
          if (key === 'currently_working') {
            formDataToSend.append(key, formData[key] ? 'true' : 'false');
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      // Append skills as a single JSON string if present
      if (formData.skills && formData.skills.length > 0) {
        formDataToSend.append('skills', JSON.stringify(formData.skills));
      }
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
    <>
    <Box sx={{ minHeight: '100vh', background: '#fff', py: 6 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Page Title */}
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#FF9100', mb: 4, textAlign: 'center', letterSpacing: 1 }}>
            Account Settings
          </Typography>
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
          {/* Main Account Area - Redesigned */}
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: softShadow, background: '#fff' }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4} alignItems="center">
                  {/* Avatar and Change Picture */}
                  <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={formData.profile_picture ? URL.createObjectURL(formData.profile_picture) : profile?.profile_picture_url}
                      alt="Profile Picture"
                      sx={{ width: 110, height: 110, mb: 1, border: `4px solid ${orange}`, fontWeight: 700, fontSize: 36, bgcolor: orange, color: '#fff', boxShadow: '0 4px 24px 0 #FF910044', transition: 'box-shadow 0.3s', position: 'relative' }}
                    >
                      {(!profile?.profile_picture_url && !formData.profile_picture && profile?.user) && getInitials(profile.user.first_name, profile.user.last_name)}
                    </Avatar>
                    <label htmlFor="profile-picture-input" style={{ width: '100%' }}>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        id="profile-picture-input"
                        onChange={handleProfilePictureChange}
                      />
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PhotoCameraIcon />}
                        component="span"
                        sx={{ color: orange, borderColor: orange, fontWeight: 600, borderRadius: 2, mt: 1, '&:hover': { borderColor: darkOrange, background: `${orange}11` } }}
                      >
                        Change Picture
                      </Button>
                    </label>
                  </Grid>
                  {/* Form Fields */}
                  <Grid item xs={12} md={9}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="account_holder_name"
                          value={formData.account_holder_name}
                          onChange={handleFormChange}
                          InputProps={{ sx: { borderRadius: 2, fontWeight: 500 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          value={profile?.user?.email || ''}
                          InputProps={{ readOnly: true, sx: { borderRadius: 2, fontWeight: 500, background: '#F9FAFB' } }}
                        />
                      </Grid>
                      {/* Currently Working Card */}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', background: orange + '11', borderRadius: 3, px: 3, py: 2, boxShadow: '0 2px 8px 0 #FF910022', gap: 2 }}>
                          <PersonIcon sx={{ color: orange, fontSize: 32, mr: 1 }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: '#222', fontSize: 18 }}>Currently Working</Typography>
                            <Typography sx={{ color: '#555', fontSize: 14 }}>Let employers know your availability</Typography>
                          </Box>
                          <Switch
                            checked={formData.currently_working}
                            onChange={handleFormChange}
                            name="currently_working"
                            color="warning"
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: orange }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: orange } }}
                          />
                        </Box>
                      </Grid>
                      {/* Save Changes Button */}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            sx={{ background: orange, color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 2, px: 5, py: 1.5, boxShadow: '0 4px 16px 0 #FF910044', '&:hover': { background: darkOrange } }}
                          >
                            Save Changes
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </form>
              {/* Resume Upload Card */}
              <Box sx={{ mt: 5, background: '#E8F0FE', borderRadius: 4, p: 3, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 2px 12px 0 #60A5FA22', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <UploadFileIcon sx={{ color: '#2563EB', fontSize: 40 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#2563EB', fontSize: 18 }}>Upload Your Resume</Typography>
                    <Typography sx={{ color: '#222', fontSize: 15 }}>
                      {formData.resume || profile?.resume_url
                        ? 'View your resume or Upload a new one'
                        : 'Help employers learn more about your experience'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  {formData.resume || profile?.resume_url ? (
                    <>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        sx={{ background: '#2563EB', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, fontSize: 16, boxShadow: '0 2px 8px 0 #2563EB22', '&:hover': { background: '#1D4ED8' } }}
                      >
                        Upload New Resume
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeChange}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        href={formData.resume ? undefined : profile?.resume_url}
                        target="_blank"
                        sx={{ color: '#2563EB', borderColor: '#2563EB', fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, fontSize: 16, '&:hover': { borderColor: '#1D4ED8', background: '#2563EB11' } }}
                        disabled={!!formData.resume}
                      >
                        {formData.resume ? formData.resume.name : 'View Current Resume'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        sx={{ background: '#2563EB', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, fontSize: 16, boxShadow: '0 2px 8px 0 #2563EB22', '&:hover': { background: '#1D4ED8' } }}
                      >
                        Upload Resume
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeChange}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setShowResumeBuilder(true)}
                        sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.2, fontSize: 16, borderColor: '#FF9100', color: '#FF9100', '&:hover': { borderColor: '#FF9100', background: '#FF910011' } }}
                      >
                        Build with Jobify
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
                {/* Resume Builder Wizard Inline */}
                {showResumeBuilder && (
                  <Box sx={{ mt: 4 }}>
                    <ResumeBuilderWizard onClose={() => setShowResumeBuilder(false)} />
                  </Box>
                )}
                {/* Accessibility Settings Accordion - moved here */}
                <Box sx={{ mt: 4 }}>
                  <Accordion
                    expanded={accessOpen}
                    onChange={() => setAccessOpen((prev) => !prev)}
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 2px 12px 0 #FF910022',
                      background: '#fff',
                      '&:before': { display: 'none' },
                      mb: 2,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#FF9100' }} />}
                      sx={{
                        borderRadius: 3,
                        background: '#FFF6ED',
                        color: '#FF9100',
                        fontWeight: 700,
                        fontSize: 18,
                        px: 3,
                        py: 2,
                        boxShadow: '0 2px 8px 0 #FF910022',
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: '#FF9100' }}>
                        Accessibility Settings
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ background: '#fff', borderRadius: 3 }}>
                      <AccessibilitySettings />
                    </AccordionDetails>
                  </Accordion>
                </Box>
            </Paper>
          </Grid>

          {/* Skills Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: softShadow, background: '#fff' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon sx={{ color: orange, fontSize: 30 }} /> Add Skills
              </Typography>
              {Object.entries(skillCategories).map(([category, skillsList]) => {
                let icon = null;
                if (category === 'Academic & Core Skills') icon = <MenuBookIcon sx={{ color: purple, mr: 1 }} />;
                if (category === 'Soft & Interpersonal Skills') icon = <HandshakeIcon sx={{ color: green, mr: 1 }} />;
                if (category === 'Technical & Computer Skills') icon = <ComputerIcon sx={{ color: orange, mr: 1 }} />;
                if (category === 'Career & Project Skills') icon = <RocketLaunchIcon sx={{ color: darkOrange, mr: 1 }} />;
                return (
                  <Accordion key={category} sx={{ mb: 1, borderRadius: 2, background: '#FAFAFA', boxShadow: 'none', '&:before': { display: 'none' }, transition: 'box-shadow 0.3s', '&.Mui-expanded': { boxShadow: softShadow } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: orange }} />} sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center' } }}>
                      <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>{icon}{category}</Typography>
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
                              sx={{ backgroundColor: orange + '22', color: darkOrange, fontWeight: 500, borderRadius: 2, px: 2, py: 0.5, fontSize: 15, transition: 'background 0.2s', '&:hover': { background: orange + '44' } }}
                            />
                          )
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
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
                    sx={{ background: orange + '33', color: darkOrange, fontWeight: 600, borderRadius: 2, px: 2, py: 0.5, fontSize: 15, boxShadow: '0 2px 8px 0 #FF910022', transition: 'background 0.2s', '&:hover': { background: orange + '55' } }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* References Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: softShadow, background: '#fff' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupsIcon sx={{ color: orange, fontSize: 30 }} /> References
              </Typography>
              <Grid container spacing={3}>
                {references.map((reference) => (
                  <Grid item xs={12} md={6} key={reference.id}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px 0 #FF910022', background: '#FFF6ED', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 4px 24px 0 #FF910044' } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: orange, color: '#fff', width: 48, height: 48, fontWeight: 700, fontSize: 22 }}>
                              {reference.name ? reference.name[0] : 'R'}
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{reference.name || 'N/A'}</Typography>
                              <Typography color="textSecondary">{reference.relation || 'N/A'}</Typography>
                              <Typography sx={{ color: orange, fontWeight: 500 }}>{reference.contact || 'N/A'}</Typography>
                            </Box>
                          </Box>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteReference(reference.id)}
                            sx={{ transition: 'color 0.2s', '&:hover': { color: orange } }}
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
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowNewReferenceForm(true)}
                      sx={{ mt: 2, background: green, color: '#fff', fontWeight: 600, '&:hover': { background: '#16A34A' } }}
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
                            sx={{ background: green, color: '#fff', fontWeight: 600, '&:hover': { background: '#16A34A' } }}
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
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: softShadow, background: '#fff' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ color: orange, fontSize: 30 }} /> Education
              </Typography>
              <Grid container spacing={3}>
                {education.filter((edu) => edu).map((edu) => (
                  <Grid item xs={12} md={6} key={edu.id}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px 0 #FF910022', background: '#FFF6ED', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 4px 24px 0 #FF910044' } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: orange, color: '#fff', width: 48, height: 48, fontWeight: 700, fontSize: 22 }}>
                              <SchoolIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{edu.school_name || 'N/A'}</Typography>
                              <Typography color="textSecondary">
                                Graduated: {edu.graduation_date ? new Date(edu.graduation_date).toLocaleDateString() : 'N/A'}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip label={`GPA: ${edu.gpa || 'N/A'}`}
                                  sx={{ background: green + '22', color: green, fontWeight: 700, borderRadius: 2, px: 2, py: 0.5, fontSize: 15 }}
                                />
                              </Box>
                            </Box>
                          </Box>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteEducation(edu.id)}
                            sx={{ transition: 'color 0.2s', '&:hover': { color: orange } }}
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
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowNewEducationForm(true)}
                      sx={{ mt: 2, background: green, color: '#fff', fontWeight: 600, '&:hover': { background: '#16A34A' } }}
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
                            sx={{ background: green, color: '#fff', fontWeight: 600, '&:hover': { background: '#16A34A' } }}
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
    </Box>
    </>
  );
};

export default Account;