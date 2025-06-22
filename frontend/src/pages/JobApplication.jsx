import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  useTheme,
  Divider,
  AppBar,
  Toolbar,
  InputAdornment,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { jobsAPI, profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../contexts/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  AccountCircle as AccountCircleIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  RateReview as RateReviewIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  MailOutline as MailOutlineIcon,
  ContactPhone as ContactPhoneIcon,
  CalendarToday as CalendarTodayIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const JobApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, accessToken } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [jobDetails, setJobDetails] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume: null,
    references: [{ name: '', relation: '', contact: '' }],
    education: [{ school: '', graduationDate: '', gpa: '' }],
    customAnswers: {},
  });
  const [grade, setGrade] = useState(0);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState(null);

  const [stepIcons, setStepIcons] = useState({});
  const [stepTitles, setStepTitles] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch job data - profile data will come from a single API call
        const jobData = await jobsAPI.getById(id);
        const profileData = await profileAPI.get();

        setJobDetails(jobData);
        
        // Dynamically set steps based on custom questions
        const baseSteps = ['Personal Information', 'References', 'Education'];
        const reviewStep = 'Review & Submit';
        let dynamicSteps = [...baseSteps];
        
        // Check if jobDetails has custom questions and they are not empty
        if (jobData?.custom_questions && Array.isArray(jobData.custom_questions) && jobData.custom_questions.length > 0) {
          dynamicSteps.push('Custom Questions');
        }
        
        dynamicSteps.push(reviewStep);
        setSteps(dynamicSteps);
        
        let profileInfo = profileData;
        // Handle if the response is wrapped in a data property
        if (profileData.data) {
          profileInfo = profileData.data;
        }
        
        setProfile(profileInfo);

        // Fill form with user information from the unified profile response
        const updatedFormData = {
          name: '',
          email: '',
          resume: null,
          references: [{ name: '', relation: '', contact: '' }],
          education: [{ school: '', graduationDate: '', gpa: '' }],
          customAnswers: {},
        };

        // Set personal information from profile user data
        if (profileInfo?.user) {
          updatedFormData.name = `${profileInfo.user.first_name || ''} ${profileInfo.user.last_name || ''}`.trim();
          updatedFormData.email = profileInfo.user.email || '';
        }

        // Set references from profile references array
        if (profileInfo?.references && Array.isArray(profileInfo.references) && profileInfo.references.length > 0) {
          updatedFormData.references = profileInfo.references.map(ref => ({
            name: ref.name || '',
            relation: ref.relation || '',
            contact: ref.contact || ''
          }));
        }

        // Set education from profile education array
        if (profileInfo?.education && Array.isArray(profileInfo.education) && profileInfo.education.length > 0) {
          updatedFormData.education = profileInfo.education.map(edu => ({
            school: edu.school_name || '',
            graduationDate: edu.graduation_date || '',
            gpa: edu.gpa || ''
          }));
        }


        setFormData(updatedFormData);

        const iconComponents = {
          'Personal Information': AccountCircleIcon,
          'References': GroupIcon,
          'Education': SchoolIcon,
          'Custom Questions': QuizIcon,
          'Review & Submit': RateReviewIcon,
        };

        const titles = {
          'Personal Information': { title: "Personal Information", subtitle: "Let's start with your personal details" },
          'References': { title: "References", subtitle: "Provide some professional or academic references" },
          'Education': { title: "Education", subtitle: "Tell us about your educational background" },
          'Custom Questions': { title: "Custom Questions", subtitle: "Answer some questions from the employer" },
          'Review & Submit': { title: "Review & Submit", subtitle: "One last look before you submit your application!" },
        };
        
        const icons = {};
        const stepTitlesData = {};
        dynamicSteps.forEach((step, index) => {
            const IconComponent = iconComponents[step];
            icons[index] = IconComponent;
            stepTitlesData[index] = { ...titles[step], icon: <IconComponent sx={{ fontSize: 50, color: 'rgba(255,255,255,0.3)'}} /> };
        });

        setStepIcons(icons);
        setStepTitles(stepTitlesData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (section, index, field, value) => {
    if (section === 'references' || section === 'education') {
      const newArray = [...formData[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      setFormData(prev => ({ ...prev, [section]: newArray }));
    } else if (section === 'customAnswers') {
      setFormData(prev => ({
        ...prev,
        customAnswers: { ...prev.customAnswers, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addItem = (section) => {
    const newItem = section === 'references' 
      ? { name: '', relation: '', contact: '' }
      : { school: '', graduationDate: '', gpa: '' };
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Helper to upload resume and get URL (if needed)
  const uploadResumeAndGetUrl = async (resumeFile) => {
    // This assumes you have an endpoint to upload resumes and get a URL back
    // If not, you may need to implement this in the backend
    // For now, we'll assume the resume is uploaded as part of the profile or application
    // and cannot be graded until it's uploaded. If you have an endpoint, use it here.
    // Placeholder: return null to indicate not implemented
    return null;
  };

  // Function to calculate grade
  const calculateGrade = async (resumeUrl, jobDescription) => {
    if (!resumeUrl || !jobDescription) return;
    setGradeLoading(true);
    setGradeError(null);
    try {
      const gradeResponse = await api.post('grade_applicant_live/', {
        resume_url: resumeUrl,
        description: jobDescription
      });
      if (!gradeResponse.data) {
        throw new Error('No data received from grade calculation');
      }
      const gradeText = gradeResponse.data.grade || gradeResponse.data;
      let gradeValue = 0;
      if (typeof gradeText === 'number') {
        gradeValue = gradeText;
      } else {
        const gradeMatch = String(gradeText).match(/^(\d+);?/);
        if (gradeMatch) {
          gradeValue = parseInt(gradeMatch[1], 10);
        } else {
          throw new Error('Invalid grade format received');
        }
      }
      setGrade(gradeValue);
    } catch (err) {
      setGradeError('Failed to calculate grade');
      setGrade(0);
    } finally {
      setGradeLoading(false);
    }
  };

  // Effect: Calculate grade when resume or job description changes
  useEffect(() => {
    // Only run if jobDetails and profile are loaded
    if (!jobDetails) return;
    // If a new resume is uploaded, we need to upload it and get a URL (not implemented here)
    if (formData.resume) {
      // If you have a resume upload endpoint, use it here to get a URL, then call calculateGrade
      // For now, skip grading for new uploads unless you implement uploadResumeAndGetUrl
      setGrade(0);
      setGradeError('Live grading for uploaded resumes is not implemented.');
      setGradeLoading(false);
    } else if (profile?.resume_url) {
      calculateGrade(profile.resume_url, jobDetails.description);
    } else {
      setGrade(0);
      setGradeError(null);
      setGradeLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.resume, profile?.resume_url, jobDetails?.description]);

  const handleResumeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
    // Optionally, trigger grade calculation for uploaded resume if uploadResumeAndGetUrl is implemented
    // If you implement uploadResumeAndGetUrl, call it here and then call calculateGrade with the new URL
  };

  const handleSubmit = async () => {
    try {
      // Create FormData object to handle file upload
      const applicationFormData = new FormData();
      applicationFormData.append('name', formData.name);
      applicationFormData.append('email', formData.email);
      if (formData.resume) {
        applicationFormData.append('resume', formData.resume);
      }
      formData.references.forEach((ref, index) => {
        applicationFormData.append(`reference_name_${index + 1}`, ref.name);
        applicationFormData.append(`reference_relation_${index + 1}`, ref.relation);
        applicationFormData.append(`reference_contact_${index + 1}`, ref.contact);
      });
      formData.education.forEach((edu, index) => {
        applicationFormData.append(`school_name_${index + 1}`, edu.school);
        applicationFormData.append(`graduation_date_${index + 1}`, edu.graduationDate);
        applicationFormData.append(`gpa_${index + 1}`, edu.gpa);
      });
      Object.entries(formData.customAnswers).forEach(([question, answer]) => {
        applicationFormData.append('custom_questions[]', answer);
      });
      // No grade calculation here
      const response = await jobsAPI.apply(id, applicationFormData);
      if(response.message || response.data.message === "Application submitted successfully") {
        navigate('/jobs');
      } else {
        setError('Failed to submit application');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    }
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      height: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        height: { duration: 0.3 }
      }
    }),
    center: {
      x: 0,
      opacity: 1,
      height: "auto",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        height: { duration: 0.3 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      height: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        height: { duration: 0.3 }
      }
    })
  };

  const renderStepContent = (step) => {
    const stepIndex = steps.indexOf(step);
    const { title, subtitle, icon } = stepTitles[stepIndex] || {};

    const stepContent = () => {
        switch (step) {
            case 'Personal Information':
              return (
                <>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('personal', null, 'name', e.target.value)}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('personal', null, 'email', e.target.value)}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>Resume</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                    >
                      {formData.resume ? 'Change Resume' : 'Upload Resume'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                      />
                    </Button>
                    {formData.resume && (
                      <Typography variant="body2" color="text.secondary">
                        Selected: {formData.resume.name}
                      </Typography>
                    )}
                    {profile?.resume_url && !formData.resume && (
                      <Button
                        variant="text"
                        href={profile.resume_url}
                        target="_blank"
                      >
                        View Current Resume
                      </Button>
                    )}
                  </Box>
                  {!formData.resume && !profile?.resume_url && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {jobDetails?.requires_resume 
                        ? "A resume is required for this position. Please upload your resume to continue."
                        : "While not required, uploading a resume can strengthen your application."}
                    </Alert>
                  )}
                </>
              );

            case 'References':
              return (
                <>
                  <Typography variant="h6" gutterBottom>References</Typography>
                  {formData.references.map((reference, index) => (
                    <React.Fragment key={index}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Reference Name"
                            value={reference.name}
                            onChange={(e) => handleInputChange('references', index, 'name', e.target.value)}
                            margin="normal"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AccountCircleIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Relation"
                            value={reference.relation}
                            onChange={(e) => handleInputChange('references', index, 'relation', e.target.value)}
                            margin="normal"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <GroupIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Contact"
                            value={reference.contact}
                            onChange={(e) => handleInputChange('references', index, 'contact', e.target.value)}
                            margin="normal"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ContactPhoneIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {index > 0 && (
                            <Button
                              color="error"
                              onClick={() => removeItem('references', index)}
                              sx={{ mt: 1 }}
                            >
                              Remove Reference
                            </Button>
                          )}
                        </Box>
                      </motion.div>
                      {index < formData.references.length - 1 && <Divider sx={{ my: 2 }} />}
                    </React.Fragment>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => addItem('references')}
                    sx={{ mt: 2 }}
                  >
                    Add Reference
                  </Button>
                </>
              );

            case 'Education':
              return (
                <>
                  <Typography variant="h6" gutterBottom>Education</Typography>
                  {formData.education.map((edu, index) => (
                    <React.Fragment key={index}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label="School Name"
                            value={edu.school}
                            onChange={(e) => handleInputChange('education', index, 'school', e.target.value)}
                            margin="normal"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SchoolIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Graduation Date"
                            type="date"
                            value={edu.graduationDate}
                            onChange={(e) => handleInputChange('education', index, 'graduationDate', e.target.value)}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarTodayIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="GPA"
                            type="number"
                            value={edu.gpa}
                            onChange={(e) => handleInputChange('education', index, 'gpa', e.target.value)}
                            margin="normal"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <StarIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {index > 0 && (
                            <Button
                              color="error"
                              onClick={() => removeItem('education', index)}
                              sx={{ mt: 1 }}
                            >
                              Remove Education
                            </Button>
                          )}
                        </Box>
                      </motion.div>
                      {index < formData.education.length - 1 && <Divider sx={{ my: 2 }} />}
                    </React.Fragment>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => addItem('education')}
                    sx={{ mt: 2 }}
                  >
                    Add Education
                  </Button>
                </>
              );

            case 'Custom Questions':
              // Only render if Custom Questions step exists
              if (steps.includes('Custom Questions')) {
                return (
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      maxWidth: '800px',
                      margin: '0 auto'
                    }}>
                      {(() => {
                        const parseQuestions = (input) => {
                          if (!input) return [];
                          if (Array.isArray(input)) return input;
                          return [];
                        };

                        const questions = parseQuestions(jobDetails?.custom_questions);
                        
                        return questions.map((question, index) => (
                          <Box key={index} sx={{ width: '100%', mb: 4 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                              {question}
                            </Typography>
                            <TextField
                              fullWidth
                              value={formData.customAnswers[question] || ''}
                              onChange={(e) => handleInputChange('customAnswers', null, question, e.target.value)}
                              multiline
                              minRows={3}
                              maxRows={20}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& textarea': {
                                    resize: 'vertical',
                                    minHeight: '100px'
                                  }
                                }
                              }}
                            />
                          </Box>
                        ));
                      })()}
                    </Box>
                );
              }
              return null; // Return null if Custom Questions step is not in steps

            case 'Review & Submit':
              return (
                  <Box>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Personal Information</Typography>
                      <Typography>Name: {formData.name}</Typography>
                      <Typography>Email: {formData.email}</Typography>
                    </Paper>
                    {jobDetails?.requires_resume && (
                      <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Resume</Typography>
                        {formData.resume ? (
                          <Typography>New Resume Uploaded: {formData.resume.name}</Typography>
                        ) : profile?.resume_url ? (
                          <Typography>Using Existing Resume</Typography>
                        ) : (
                          <Typography color="error">No Resume Provided</Typography>
                        )}
                      </Paper>
                    )}
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>References</Typography>
                      {formData.references.map((ref, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography>Name: {ref.name}</Typography>
                          <Typography>Relation: {ref.relation}</Typography>
                          <Typography>Contact: {ref.contact}</Typography>
                        </Box>
                      ))}
                    </Paper>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Education</Typography>
                      {formData.education.map((edu, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography>School: {edu.school}</Typography>
                          <Typography>Graduation Date: {edu.graduationDate}</Typography>
                          <Typography>GPA: {edu.gpa}</Typography>
                        </Box>
                      ))}
                    </Paper>
                    {Object.keys(formData.customAnswers).length > 0 &&
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>Custom Questions</Typography>
                            {Object.entries(formData.customAnswers).map(([question, answer]) => (
                            <Box key={question} sx={{ mb: 1 }}>
                                <Typography><strong>{question}</strong></Typography>
                                <Typography>{answer}</Typography>
                            </Box>
                            ))}
                        </Paper>
                    }
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                      <ProgressCircle percentage={grade} loading={gradeLoading} error={gradeError} />
                    </Box>
                  </Box>
              );

            default:
              return null;
        }
    };

    if (!title) return null;

    return (
      <motion.div
        key={step}
        custom={1}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        layout
      >
        <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ff6b00', color: 'white', p: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                    <Typography>{subtitle}</Typography>
                </Box>
                {icon}
            </Box>
            <Box sx={{ p: 3 }}>
                {stepContent()}
            </Box>
        </Paper>
      </motion.div>
    );
  };

  const CustomStepper = ({ activeStep, steps, stepIcons }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
      {steps.map((label, index) => {
        const Icon = stepIcons[index];
        const isActive = activeStep === index;
        const isCompleted = activeStep > index;
        
        return (
          <React.Fragment key={label}>
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                onClick={() => setActiveStep(index)}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: isCompleted ? '#ff6b00' : isActive ? '#ff6b00' : 'grey.200',
                  color: isCompleted || isActive ? 'white' : 'grey.500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  border: isActive ? '3px solid #ffd1b3' : '3px solid transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 0 15px #FF6B00',
                  },
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                }}
              >
                {Icon ? (isCompleted ? <CheckCircleIcon /> : <Icon />) : null}
              </Box>
              <Typography sx={{ fontWeight: isActive || isCompleted ? 'bold' : 'normal', color: isActive || isCompleted ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
            </Box>
            {index < steps.length - 1 && (
              <Box sx={{ flex: 1, height: '3px', bgcolor: isCompleted ? '#ff6b00' : 'grey.200', mt: '24px', mx: 1 }} />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );

  // Update ProgressCircle to show loading/error
  const ProgressCircle = ({ percentage, loading, error }) => {
    const circumference = 314; // 2 * Math.PI * 50 (radius)
    const offset = circumference - (percentage / 100) * circumference;
    const hue = Math.round(120 * (percentage / 100)); // 0 = Red, 120 = Green
    const color = `hsl(${hue}, 100%, 50%)`;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <Typography variant="h6" gutterBottom>Applicant Grade</Typography>
        <Box sx={{ position: 'relative', width: 120, height: 120 }}>
          {loading ? (
            <CircularProgress size={120} thickness={4} />
          ) : error ? (
            <Alert severity="error" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%' }}>{error}</Alert>
          ) : (
            <>
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {percentage}%
              </Typography>
            </>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', p: 3 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                Apply for {jobDetails?.title}
                 <AutoAwesomeIcon sx={{ color: '#ff6b00', ml: 1, fontSize: 'inherit' }} />
            </Typography>
            <Typography variant="h6" color="text.secondary">
                at {jobDetails?.company_name}. Take the next step in your career journey!
            </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <CustomStepper activeStep={activeStep} steps={steps} stepIcons={stepIcons} />
        
        <motion.div
          layout
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '500px'
          }}
        >
          <AnimatePresence initial={false} custom={activeStep} mode="wait">
            {renderStepContent(steps[activeStep])}
          </AnimatePresence>
        </motion.div>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ color: '#ff6b00' }}
          >
            Back
          </Button>

          <Typography variant="body2" color="text.secondary">Step {activeStep + 1} of {steps.length}</Typography>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#ff6b00', '&:hover': { bgcolor: '#e65100' }, borderRadius: '20px', px: 3 }}
            >
              Submit Application
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#ff6b00', '&:hover': { bgcolor: '#e65100' }, borderRadius: '20px', px: 3 }}
            >
              Next
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default JobApplication; 