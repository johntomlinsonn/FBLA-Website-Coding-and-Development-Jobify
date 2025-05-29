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
  useTheme,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import { jobsAPI, profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../contexts/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume: null,
    references: [{ name: '', relation: '', contact: '' }],
    education: [{ school: '', graduationDate: '', gpa: '' }],
    customAnswers: {},
  });

  // Get steps based on job requirements
  const getSteps = () => {
    const baseSteps = ['Personal Information', 'References', 'Education', 'Custom Questions', 'Review & Submit'];
    return baseSteps;
  };

  const steps = getSteps();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, profileData, referencesData, educationData] = await Promise.all([
          jobsAPI.getById(id),
          profileAPI.get(),
          profileAPI.getReferences(),
          profileAPI.getEducation(),
        ]);

        setJobDetails(jobData);
        setProfile(profileData.data);
        
        // Set personal information from profile data
        if (profileData.data && profileData.data.user) {
          setFormData(prev => ({
            ...prev,
            name: `${profileData.data.user.first_name} ${profileData.data.user.last_name}`,
            email: profileData.data.user.email,
          }));
        }

        // Set references if they exist
        if (referencesData.data && referencesData.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            references: referencesData.data.map(ref => ({
              name: ref.name || '',
              relation: ref.relation || '',
              contact: ref.contact || ''
            }))
          }));
        }

        // Set education if it exists
        if (educationData.data && educationData.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            education: educationData.data.map(edu => ({
              school: edu.school_name || '',
              graduationDate: edu.graduation_date || '',
              gpa: edu.gpa || ''
            }))
          }));
        }
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

  const handleSubmit = async () => {
    try {
      // Create FormData object to handle file upload
      const applicationFormData = new FormData();
      
      // Add basic information
      applicationFormData.append('name', formData.name);
      applicationFormData.append('email', formData.email);
      
      // Add resume if present
      if (formData.resume) {
        applicationFormData.append('resume', formData.resume);
      }
      
      // Add references
      formData.references.forEach((ref, index) => {
        applicationFormData.append(`reference_name_${index + 1}`, ref.name);
        applicationFormData.append(`reference_relation_${index + 1}`, ref.relation);
        applicationFormData.append(`reference_contact_${index + 1}`, ref.contact);
      });
      
      // Add education
      formData.education.forEach((edu, index) => {
        applicationFormData.append(`school_name_${index + 1}`, edu.school);
        applicationFormData.append(`graduation_date_${index + 1}`, edu.graduationDate);
        applicationFormData.append(`gpa_${index + 1}`, edu.gpa);
      });
      
      // Add custom answers
      Object.entries(formData.customAnswers).forEach(([question, answer]) => {
        applicationFormData.append('custom_questions[]', answer);
      });

      // Get grade calculation using the API service
      const gradeResponse = await api.post('grade_applicant_live/', {
        resume_url: profile?.resume_url || '',
        description: jobDetails?.description || ''
      });

      console.log('Grade response:', gradeResponse); // Debug log

      if (!gradeResponse.data) {
        console.error('No data received from grade calculation');
        throw new Error('Failed to calculate grade: No data received');
      }

      // Extract the grade from the response
      const gradeText = gradeResponse.data.grade || gradeResponse.data;
      console.log('Grade text:', gradeText); // Debug log

      // If it's already a number, use it directly
      if (typeof gradeText === 'number') {
        setGrade(gradeText);
      } else {
        // Otherwise try to parse it from the string format
        const gradeMatch = String(gradeText).match(/^(\d+);/);
        
        if (!gradeMatch) {
          console.error('Invalid grade format received:', gradeText);
          throw new Error('Failed to calculate grade: Invalid response format');
        }

        const grade = parseInt(gradeMatch[1], 10);
        if (isNaN(grade)) {
          console.error('Invalid grade number:', gradeMatch[1]);
          throw new Error('Failed to calculate grade: Invalid grade number');
        }

        setGrade(grade);
      }
      
      // Submit application
      const response = await jobsAPI.apply(id, applicationFormData);
      
      if (response.ok) {
        navigate('/jobs');
      } else {
        setError('Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Failed to submit application');
    }
  };

  const handleResumeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

  // Add grade calculation state
  const [grade, setGrade] = useState(0);

  // Add progress circle component
  const ProgressCircle = ({ percentage }) => {
    const circumference = 314; // 2 * Math.PI * 50 (radius)
    const offset = circumference - (percentage / 100) * circumference;
    const hue = Math.round(120 * (percentage / 100)); // 0 = Red, 120 = Green
    const color = `hsl(${hue}, 100%, 50%)`;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <Typography variant="h6" gutterBottom>Applicant Grade</Typography>
        <Box sx={{ position: 'relative', width: 120, height: 120 }}>
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
        </Box>
      </Box>
    );
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
    switch (stepIndex) {
      case 0:
        return (
          <motion.div
            key="personal"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('personal', null, 'name', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('personal', null, 'email', e.target.value)}
                margin="normal"
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
            </Box>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="references"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>References</Typography>
              {formData.references.map((reference, index) => (
                <motion.div
                  key={index}
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
                    />
                    <TextField
                      fullWidth
                      label="Relation"
                      value={reference.relation}
                      onChange={(e) => handleInputChange('references', index, 'relation', e.target.value)}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Contact"
                      value={reference.contact}
                      onChange={(e) => handleInputChange('references', index, 'contact', e.target.value)}
                      margin="normal"
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
              ))}
              <Button
                variant="outlined"
                onClick={() => addItem('references')}
                sx={{ mt: 2 }}
              >
                Add Reference
              </Button>
            </Box>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="education"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Education</Typography>
              {formData.education.map((edu, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="School Name"
                    value={edu.school}
                    onChange={(e) => handleInputChange('education', index, 'school', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Graduation Date"
                    type="date"
                    value={edu.graduationDate}
                    onChange={(e) => handleInputChange('education', index, 'graduationDate', e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="GPA"
                    type="number"
                    value={edu.gpa}
                    onChange={(e) => handleInputChange('education', index, 'gpa', e.target.value)}
                    margin="normal"
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
              ))}
              <Button
                variant="outlined"
                onClick={() => addItem('education')}
                sx={{ mt: 2 }}
              >
                Add Education
              </Button>
            </Box>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="custom"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Box sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>Custom Questions</Typography>
              {(() => {
                // Parse the questions into an array of full questions
                const parseQuestions = (input) => {
                  if (!input) return [];
                  
                  if (Array.isArray(input)) {
                    // If it's already an array, join the characters and clean it
                    const fullQuestion = input.join('').replace(/^\[|\]$/g, '').replace(/^'|'$/g, '');
                    return [fullQuestion];
                  }
                  
                  if (typeof input === 'string') {
                    // If it's a string, clean it
                    const cleanStr = input.replace(/^\[|\]$/g, '').replace(/^'|'$/g, '');
                    return [cleanStr];
                  }
                  
                  return [];
                };

                const questions = parseQuestions(jobDetails.custom_questions);
                
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
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="review"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Review Your Application</Typography>
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
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Custom Questions</Typography>
                {Object.entries(formData.customAnswers).map(([question, answer]) => (
                  <Box key={question} sx={{ mb: 1 }}>
                    <Typography><strong>{question}</strong></Typography>
                    <Typography>{answer}</Typography>
                  </Box>
                ))}
              </Paper>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <ProgressCircle percentage={grade} />
              </Box>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
        overflow: 'auto',
        backgroundColor: '#FFFFFF',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='284' height='284' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23E9E4DE' stroke-width='8.7'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23FF6B00'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3E%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3Ccircle cx='40' cy='599' r='7'/%3E%3Ccircle cx='102' cy='382' r='7'/%3E%3Ccircle cx='127' cy='80' r='7'/%3E%3Ccircle cx='370' cy='105' r='7'/%3E%3Ccircle cx='578' cy='42' r='7'/%3E%3Ccircle cx='237' cy='261' r='7'/%3E%3Ccircle cx='390' cy='382' r='7'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
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

      <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 1, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {jobDetails?.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {jobDetails?.company_name}
          </Typography>
        </Paper>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <motion.div
          layout
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <Paper 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              minHeight: '400px',
            }}
          >
            <AnimatePresence initial={false} custom={activeStep} mode="wait">
              {renderStepContent(steps[activeStep])}
            </AnimatePresence>
          </Paper>
        </motion.div>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
            >
              Submit Application
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
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