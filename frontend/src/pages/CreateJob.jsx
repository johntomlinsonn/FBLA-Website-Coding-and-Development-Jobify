import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  RocketLaunch as RocketLaunchIcon,
  Description as DescriptionIcon,
  Checklist as ChecklistIcon,
  Quiz as QuizIcon,
  RateReview as RateReviewIcon,
  WorkOutline as WorkOutlineIcon,
  Business as BusinessIcon,
  MailOutline as MailOutlineIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  LightbulbOutlined as LightbulbOutlinedIcon,
  AutoAwesome as AutoAwesomeIcon,
  GpsFixed as GpsFixedIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { jobsAPI } from '../services/api';
import { api } from '../contexts/AuthContext';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  company_name: Yup.string().required('Company name is required'),
  company_email: Yup.string().email('Invalid email').required('Company email is required'),
  description: Yup.string().required('Description is required'),
  salary: Yup.number()
    .required('Salary is required')
    .min(0, 'Salary must be positive'),
  location: Yup.string().required('Location is required'),
  job_type: Yup.string().required('Job type is required'),
  requirements: Yup.array().of(Yup.string()),
  custom_questions: Yup.array().of(Yup.string()),
});

const stepIcons = {
  0: RocketLaunchIcon,
  1: DescriptionIcon,
  2: ChecklistIcon,
  3: QuizIcon,
  4: RateReviewIcon,
};

const CreateJob = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [jobGrade, setJobGrade] = useState(0);
  const [descriptionStable, setDescriptionStable] = useState(false);
  const [locationStable, setLocationStable] = useState(false);
  const descriptionTimerRef = useRef(null);
  const locationTimerRef = useRef(null);

  const jobTypes = [
    'Part-time',
    'Full-time',
    'Seasonal',
    'Internship',
    'Summer Job',
    'Weekend',
    'After School',
  ];

  const steps = ['Basic Information', 'Job Details', 'Requirements', 'Custom Questions', 'Review & Submit'];

  const formik = useFormik({
    initialValues: {
      title: '',
      company_name: '',
      company_email: '',
      description: '',
      salary: '',
      location: '',
      job_type: '',
      requirements: [],
      custom_questions: [''],
      grade: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Create job data with the current jobGrade
        const jobData = {
          ...values,
          grade: jobGrade,
          requirements: values.requirements.filter(req => req.trim() !== ''),
          custom_questions: values.custom_questions.filter(q => q.trim() !== ''),
        };
        console.log('Submitting job with data:', jobData);
        await jobsAPI.create(jobData);
        navigate('/');
      } catch (err) {
        console.error('Error creating job:', err);
        setError(err.response?.data?.message || 'Failed to create job posting');
      } finally {
        setLoading(false);
      }
    },
  });

  // Function to calculate job grade
  const calculateJobGrade = async (description, location) => {
    if (!description || !location) return;

    try {
      const response = await api.get(`/grade_job_live/?description=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`);
      if (response.data && response.data.grade !== undefined) {
        let receivedGrade = response.data.grade;
        setJobGrade(parseInt(receivedGrade));
      }
    } catch (error) {
      console.error("Error calculating grade:", error);
      setJobGrade(0);
    }
  };

  // Handle description changes
  const handleDescriptionChange = (e) => {
    formik.handleChange(e);
    setDescriptionStable(false);
    
    if (descriptionTimerRef.current) {
      clearTimeout(descriptionTimerRef.current);
    }
    
    descriptionTimerRef.current = setTimeout(() => {
      setDescriptionStable(true);
    }, 3000);
  };

  // Handle location changes
  const handleLocationChange = (e) => {
    formik.handleChange(e);
    setLocationStable(false);
    
    if (locationTimerRef.current) {
      clearTimeout(locationTimerRef.current);
    }
    
    locationTimerRef.current = setTimeout(() => {
      setLocationStable(true);
    }, 3000);
  };

  // Effect to update grade when both fields are stable
  useEffect(() => {
    if (descriptionStable && locationStable && 
        formik.values.description.trim() && 
        formik.values.location.trim()) {
      calculateJobGrade(formik.values.description, formik.values.location);
    }
  }, [descriptionStable, locationStable]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (descriptionTimerRef.current) {
        clearTimeout(descriptionTimerRef.current);
      }
      if (locationTimerRef.current) {
        clearTimeout(locationTimerRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    // Basic validation for the current step
    let fieldsToValidate = [];
    switch (activeStep) {
        case 0:
            fieldsToValidate = ['title', 'company_name', 'company_email'];
            break;
        case 1:
            fieldsToValidate = ['description', 'location', 'salary', 'job_type'];
            break;
        default:
            break;
    }
    
    formik.validateForm().then(errors => {
        const hasErrors = fieldsToValidate.some(field => errors[field]);
        if (hasErrors) {
            formik.setTouched(fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
        } else {
            setActiveStep((prevStep) => prevStep + 1);
        }
    });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddField = (field) => {
    formik.setFieldValue(field, [...formik.values[field], '']);
  };

  const handleRemoveField = (field, index) => {
    const newValues = formik.values[field].filter((_, i) => i !== index);
    formik.setFieldValue(field, newValues);
  };

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
    const stepContent = () => {
      switch (step) {
        case 0:
          return (
            <>
              <TextField
                fullWidth
                label="Job Title"
                placeholder="e.g., Social Media Intern, Junior Developer, Marketing Assistant"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Your awesome company name"
                name="company_name"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                helperText={formik.touched.company_name && formik.errors.company_name}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Company Email"
                placeholder="hr@yourcompany.com"
                name="company_email"
                type="email"
                value={formik.values.company_email}
                onChange={formik.handleChange}
                error={formik.touched.company_email && Boolean(formik.errors.company_email)}
                helperText={formik.touched.company_email ? formik.errors.company_email : "This email will be used for application notifications"}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 107, 0, 0.1)', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: '#ff6b00' }}>
                  <LightbulbOutlinedIcon sx={{ mr: 1 }} />
                  Pro Tips for High School Recruiters
                </Typography>
                <List dense>
                  {[
                    "Use clear, appealing job titles that students can understand",
                    "Highlight growth opportunities and mentorship in your company name/description",
                    "Consider entry-level positions perfect for students starting their careers",
                  ].map((text) => (
                    <ListItem key={text} sx={{ py: 0.2 }}>
                      <ListItemIcon sx={{ minWidth: '28px', color: '#ff6b00' }}>•</ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          );

        case 1:
          return (
            <>
              <TextField
                fullWidth
                label="Job Description"
                name="description"
                value={formik.values.description}
                onChange={handleDescriptionChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                multiline
                rows={4}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formik.values.location}
                onChange={handleLocationChange}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
                margin="normal"
                 InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
               <TextField
                fullWidth
                select
                label="Job Type"
                name="job_type"
                value={formik.values.job_type}
                onChange={formik.handleChange}
                error={formik.touched.job_type && Boolean(formik.errors.job_type)}
                helperText={formik.touched.job_type && formik.errors.job_type}
                margin="normal"
                SelectProps={{ native: true }}
                 InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <option value="">Select a job type</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={formik.values.salary}
                onChange={formik.handleChange}
                error={formik.touched.salary && Boolean(formik.errors.salary)}
                helperText={formik.touched.salary && formik.errors.salary}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          );

        case 2:
          return (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Select the application materials you require from students.
              </Typography>
              <FormControl component="fieldset">
                <FormGroup>
                  {['Resume', 'References', 'Education'].map((req) => {
                    const reqValue = req.toLowerCase();
                    return (
                      <FormControlLabel
                        key={req}
                        control={
                          <Checkbox
                            checked={formik.values.requirements.includes(reqValue)}
                            onChange={(e) => {
                              const newRequirements = e.target.checked
                                ? [...formik.values.requirements, reqValue]
                                : formik.values.requirements.filter(r => r !== reqValue);
                              formik.setFieldValue('requirements', newRequirements);
                            }}
                            sx={{ '&.Mui-checked': { color: '#ff6b00' } }}
                          />
                        }
                        label={req}
                      />
                    );
                  })}
                </FormGroup>
              </FormControl>
            </>
          );

        case 3:
          return (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Add custom questions to your application to better screen candidates.
              </Typography>
              {formik.values.custom_questions.map((question, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      label={`Question ${index + 1}`}
                      value={question}
                      onChange={(e) => {
                        const newQuestions = [...formik.values.custom_questions];
                        newQuestions[index] = e.target.value;
                        formik.setFieldValue('custom_questions', newQuestions);
                      }}
                    />
                    {formik.values.custom_questions.length > 1 && (
                      <Button
                        color="error"
                        onClick={() => handleRemoveField('custom_questions', index)}
                        sx={{ ml: 1 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </motion.div>
              ))}
              <Button
                variant="outlined"
                onClick={() => handleAddField('custom_questions')}
                sx={{ color: '#ff6b00', borderColor: '#ff6b00' }}
              >
                Add Question
              </Button>
            </>
          );

        case 4:
          return (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Please review all the details before submitting your job post.
              </Typography>
              <Box>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Typography><b>Title:</b> {formik.values.title}</Typography>
                <Typography><b>Company:</b> {formik.values.company_name}</Typography>
                <Typography><b>Email:</b> {formik.values.company_email}</Typography>
                <hr style={{margin: '16px 0'}} />

                <Typography variant="h6" gutterBottom>Job Details</Typography>
                <Typography><b>Description:</b> {formik.values.description}</Typography>
                <Typography><b>Location:</b> {formik.values.location}</Typography>
                <Typography><b>Job Type:</b> {formik.values.job_type}</Typography>
                <Typography><b>Salary:</b> ${formik.values.salary}</Typography>
                 <hr style={{margin: '16px 0'}} />
                
                <Typography variant="h6" gutterBottom>Requirements</Typography>
                {formik.values.requirements.map((req) => (
                  <Typography key={req} sx={{textTransform: 'capitalize'}}>• {req}</Typography>
                ))}
                <hr style={{margin: '16px 0'}} />
                
                <Typography variant="h6" gutterBottom>Custom Questions</Typography>
                {formik.values.custom_questions.filter(q => q).map((q, index) => (
                  <Typography key={index}>• {q}</Typography>
                ))}
              </Box>
            </>
          );

        default:
          return null;
      }
    };

    const stepTitles = {
        0: { title: "Basic Information", subtitle: "Let's start with the basics - tell us about your company and the position", icon: <GpsFixedIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.3)'}} /> },
        1: { title: "Job Details", subtitle: "Provide more details about the role to attract the right candidates", icon: <DescriptionIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.3)'}} /> },
        2: { title: "Requirements", subtitle: "Specify what's needed for the application", icon: <ChecklistIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.3)'}} /> },
        3: { title: "Custom Questions", subtitle: "Ask specific questions to screen applicants", icon: <QuizIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.3)'}} /> },
        4: { title: "Review & Submit", subtitle: "One last look before your job post goes live!", icon: <RateReviewIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.3)'}} /> }
    };
    const { title, subtitle, icon } = stepTitles[step];

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
  
  const CustomStepper = ({ activeStep, steps }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
      {steps.map((label, index) => {
        const Icon = stepIcons[index];
        const isActive = activeStep === index;
        const isCompleted = activeStep > index;
        
        return (
          <React.Fragment key={label}>
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
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
                  border: isActive ? '3px solid #ffd1b3' : '3px solid transparent'
                }}
              >
                {isCompleted ? <CheckCircleIcon /> : <Icon />}
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

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', p: 3 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                Create Your Perfect Job Post
                 <AutoAwesomeIcon sx={{ color: '#ff6b00', ml: 1, fontSize: 'inherit' }} />
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Connect with talented high school students ready to start their career journey. Let's make your job posting stand out!
            </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <CustomStepper activeStep={activeStep} steps={steps} />

        <motion.div
          layout
          style={{ position: 'relative', minHeight: '500px' }}
        >
          <AnimatePresence initial={false} custom={activeStep} mode="wait">
            {renderStepContent(activeStep)}
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
              onClick={formik.handleSubmit}
              endIcon={<ArrowForwardIcon />}
              disabled={loading}
              sx={{ bgcolor: '#ff6b00', '&:hover': { bgcolor: '#e65100' }, borderRadius: '20px', px: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Job'}
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

export default CreateJob; 