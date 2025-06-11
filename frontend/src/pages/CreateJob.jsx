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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Divider,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
    // Validate current step before proceeding
    const currentStepFields = {
      0: ['title', 'company_name', 'company_email'],
      1: ['description', 'location', 'salary', 'job_type'],
      2: ['requirements'],
      3: ['custom_questions'],
    }[activeStep];

    if (currentStepFields) {
      const errors = {};
      currentStepFields.forEach(field => {
        if (field === 'requirements' || field === 'custom_questions') {
          const values = formik.values[field];
          if (!values.length || values.some(v => !v.trim())) {
            errors[field] = 'At least one item is required';
          }
        } else if (!formik.values[field]) {
          errors[field] = 'This field is required';
        }
      });

      if (Object.keys(errors).length > 0) {
        formik.setErrors(errors);
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
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
    switch (step) {
      case 0:
  return (
          <motion.div
            key="basic"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <TextField
              fullWidth
                label="Job Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
                margin="normal"
            />
            <TextField
              fullWidth
                label="Company Name"
              name="company_name"
              value={formik.values.company_name}
              onChange={formik.handleChange}
              error={formik.touched.company_name && Boolean(formik.errors.company_name)}
              helperText={formik.touched.company_name && formik.errors.company_name}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Company Email"
                name="company_email"
                type="email"
                value={formik.values.company_email}
                onChange={formik.handleChange}
                error={formik.touched.company_email && Boolean(formik.errors.company_email)}
                helperText={formik.touched.company_email && formik.errors.company_email}
                margin="normal"
            />
          </Box>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="details"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Job Details</Typography>
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
              />
              <TextField
                fullWidth
                select
                name="job_type"
                value={formik.values.job_type}
                onChange={formik.handleChange}
                error={formik.touched.job_type && Boolean(formik.errors.job_type)}
                helperText={formik.touched.job_type && formik.errors.job_type}
                margin="normal"
                SelectProps={{
                  native: true,
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
            />
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Job Grade</Typography>
                <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
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
                      stroke={`hsl(${120 * (jobGrade / 100)}, 100%, 50%)`}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - jobGrade / 100)}`}
                    />
                  </svg>
                  <Typography
                    variant="h4"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: `hsl(${120 * (jobGrade / 100)}, 100%, 50%)`,
                    }}
                  >
                    {jobGrade}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="requirements"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Requirements</Typography>
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.requirements.includes('resume')}
                        onChange={(e) => {
                          const newRequirements = e.target.checked
                            ? [...formik.values.requirements, 'resume']
                            : formik.values.requirements.filter(r => r !== 'resume');
                          formik.setFieldValue('requirements', newRequirements);
                        }}
                      />
                    }
                    label="Resume"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.requirements.includes('references')}
                        onChange={(e) => {
                          const newRequirements = e.target.checked
                            ? [...formik.values.requirements, 'references']
                            : formik.values.requirements.filter(r => r !== 'references');
                          formik.setFieldValue('requirements', newRequirements);
                        }}
                      />
                    }
                    label="References"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.requirements.includes('education')}
                        onChange={(e) => {
                          const newRequirements = e.target.checked
                            ? [...formik.values.requirements, 'education']
                            : formik.values.requirements.filter(r => r !== 'education');
                          formik.setFieldValue('requirements', newRequirements);
                        }}
                      />
                    }
                    label="Education"
                  />
                </FormGroup>
              </FormControl>
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
            layout
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Custom Questions</Typography>
              {formik.values.custom_questions.map((question, index) => (
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
                      label={`Question ${index + 1}`}
                      value={question}
                      onChange={(e) => {
                        const newQuestions = [...formik.values.custom_questions];
                        newQuestions[index] = e.target.value;
                        formik.setFieldValue('custom_questions', newQuestions);
                      }}
                      margin="normal"
                    />
                    {index > 0 && (
                      <Button
                        color="error"
                        onClick={() => handleRemoveField('custom_questions', index)}
                        sx={{ mt: 1 }}
                      >
                        Remove Question
                      </Button>
                    )}
                  </Box>
                </motion.div>
              ))}
              <Button
                variant="outlined"
                onClick={() => handleAddField('custom_questions')}
                sx={{ mt: 2 }}
              >
                Add Question
              </Button>
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
              <Typography variant="h6" gutterBottom>Review Your Job Posting</Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Basic Information</Typography>
                <Typography>Title: {formik.values.title}</Typography>
                <Typography>Company: {formik.values.company_name}</Typography>
                <Typography>Email: {formik.values.company_email}</Typography>
              </Paper>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Job Details</Typography>
                <Typography>Description: {formik.values.description}</Typography>
                <Typography>Location: {formik.values.location}</Typography>
                <Typography>Job Type: {formik.values.job_type}</Typography>
                <Typography>Salary: ${formik.values.salary}</Typography>
                <Typography>Job Grade: {jobGrade}%</Typography>
              </Paper>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Requirements</Typography>
                {formik.values.requirements.map((req, index) => (
                  <Typography key={index}>• {req}</Typography>
                ))}
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Custom Questions</Typography>
                {formik.values.custom_questions.map((q, index) => (
                  <Typography key={index}>• {q}</Typography>
                ))}
              </Paper>
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
              {renderStepContent(activeStep)}
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
              onClick={formik.handleSubmit}
              endIcon={<ArrowForwardIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Job'}
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

export default CreateJob; 