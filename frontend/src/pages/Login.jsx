import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Link as MuiLink,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  PersonOutline,
  Facebook,
  Google,
  GitHub,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/MainLayout';

// SVG Icons
const StudentIcon = (props) => (
  <img src="student.svg" alt="Logo" style={{ height: '60px' }} />
);

const RecruiterIcon = (props) => (
  <img src="recruiter.svg" alt="Logo" style={{ height: '60px' }}/>
);

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2.5),
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    transform: 'translate(14px, -9px) scale(0.75)',
    backgroundColor: theme.palette.background.paper,
    paddingLeft: '4px',
    paddingRight: '4px',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.grey[400],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  ...(variant === 'contained' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  border: `1px solid ${theme.palette.grey[400]}`,
  color: theme.palette.text.secondary,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    backgroundColor: `rgba(${theme.palette.primary.main.match(/\d+/g).join(',')}, 0.05)`,
  },
}));

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

// Animated Logo component (extracted from Landing.jsx and slightly adapted)
const AnimatedLogo = ({ pulseVariants }) => {
  const theme = useTheme();
  return (
    <motion.div
      variants={pulseVariants}
      animate="animate"
      style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRadius: "50%",
          background: theme.palette.mode === 'dark' ? '#333' : "#FFFFFF",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -5,
            left: -5,
            right: -5,
            bottom: -5,
            borderRadius: "50%",
            background: theme.palette.mode === 'dark' ? 'rgba(51,51,51,0.7)' : "rgba(255,255,255,0.7)",
            zIndex: -1,
            filter: "blur(5px)",
          },
        }}
      >
        <img
          src="/logo.svg"
          alt="Jobify Logo"
          style={{
            width: "70%",
            height: "70%",
            objectFit: "contain",
          }}
        />
      </Box>
    </motion.div>
  );
};

// Slide animation variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 400 : -400,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState(null);

  // New state for multi-step form
  const [currentStep, setCurrentStep] = useState(0); // 0 for login flow, 0 for signup part 1, 1 for signup part 2
  const [direction, setDirection] = useState(0); // 0: no slide, 1: forward, -1: backward

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear error on input change
  };

  const handleNext = () => {
    setError(''); // Clear previous errors

    // Validation for Signup Step 1
    if (!isLogin && currentStep === 0) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.username) {
        setError('Please fill in all required fields.');
        return;
      }
    }
    setDirection(1); // Set direction to forward
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(''); // Clear previous errors
    setDirection(-1); // Set direction to backward
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Final validation for login
        if (!formData.username || !formData.password) {
          setError('Please enter both username and password.');
          return;
        }
        await login(formData.username, formData.password);
        // navigate('/dashboard'); // Assuming a successful login redirects to dashboard
      } else {
        // This handles submission from Signup Step 2
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (!accountType) {
          setError('Please select an account type (Student or Recruiter)');
          return;
        }

        if (accountType === 'recruiter') {
          const disallowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
          const emailDomain = formData.email.split('@')[1];
          if (disallowedDomains.includes(emailDomain?.toLowerCase())) {
            setError(
              <>
                Recruiter accounts must use a company email address. Free email providers are not permitted.
                <br />
                Please use a different email or{' '}
                <MuiLink component={Link} to="/faq" sx={{ color: 'error.main', textDecoration: 'underline', fontWeight: 'bold' }}>
                  contact us
                </MuiLink>
                {' '}for assistance.
              </>
            );
            return;
          }
        }

        const isJobProvider = accountType === 'recruiter';

        console.log(isJobProvider);
        await signup(formData.first_name, formData.last_name, formData.email, formData.username, formData.password, isJobProvider);
        // User is automatically logged in and redirected by the signup function
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please check your credentials.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ first_name: '', last_name: '', email: '', username: '', password: '', confirmPassword: '' });
    setAccountType(null);
    setCurrentStep(0); // Reset to first step when toggling mode
    setDirection(0); // Reset direction
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 200px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='284' height='284' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23E9E4DE' stroke-width='8.7'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23FF6B00'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3E%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        py: 4
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 0
        }}
      />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            padding: theme.spacing(4),
            width: '100%',
            maxWidth: 420,
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: theme.palette.text.primary,
            textAlign: 'center',
            mx: 'auto',
            overflow: 'hidden',
            minHeight: isLogin ? '400px' : '650px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <AnimatedLogo pulseVariants={pulseVariants} />
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 2 }}>
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </Typography>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            </motion.div>
          )}

          <AnimatePresence initial={false} mode="wait" custom={direction}>
            {isLogin ? (
              // Login Flow (single step)
              <motion.form
                key="login-form"
                onSubmit={handleSubmit}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ width: '100%', position: 'relative' }}
              >
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Login to your account
                </Typography>
                <StyledTextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment:
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                  }}
                  required
                />
                <StyledTextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment:
                      <InputAdornment position="start">
                        <Lock sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                <StyledButton type="submit" variant="contained">
                  Login
                </StyledButton>
              </motion.form>
            ) : (
              // Signup Flow (multi-step)
              <>
                {currentStep === 0 && (
                  <motion.form
                    key="signup-step-0"
                    // No onSubmit here, handled by button click
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{ width: '100%', position: 'relative' }}
                  >
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      Tell us about yourself
                    </Typography>
                    <StyledTextField
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment:
                          <InputAdornment position="start">
                            <PersonOutline sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>,
                      }}
                      required
                    />
                    <StyledTextField
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment:
                          <InputAdornment position="start">
                            <PersonOutline sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>,
                      }}
                      required
                    />
                    <StyledTextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment:
                          <InputAdornment position="start">
                            <Email sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                      }}
                      required
                    />
                    <StyledTextField
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment:
                          <InputAdornment position="start">
                            <PersonOutline sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                      }}
                      required
                    />
                    <StyledButton
                      type="button"
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                    >
                      Next
                    </StyledButton>
                  </motion.form>
                )}

                {currentStep === 1 && (
                  <motion.form
                    key="signup-step-1"
                    onSubmit={handleSubmit} // This is the final submit for signup
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{ width: '100%', position: 'relative' }}
                  >
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      Set your password and account type
                    </Typography>
                    <StyledTextField
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment:
                          <InputAdornment position="start">
                            <Lock sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      required
                    />
                    <StyledTextField
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment:
                          <InputAdornment position="start">
                            <Lock sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      required
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setAccountType('student')}
                        sx={{
                          flexGrow: 1,
                          padding: '16px',
                          borderRadius: '8px',
                          borderColor: accountType === 'student' ? theme.palette.primary.main : theme.palette.grey[400],
                          borderWidth: accountType === 'student' ? '2px' : '1px',
                          color: accountType === 'student' ? theme.palette.primary.main : theme.palette.text.secondary,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          backgroundColor: accountType === 'student' ? 'rgba(255, 107, 0, 0.08)' : 'transparent',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            backgroundColor: 'rgba(255, 107, 0, 0.05)',
                          },
                        }}
                      >
                        <StudentIcon />
                        <Typography variant="subtitle1">Student</Typography>
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setAccountType('recruiter')}
                        sx={{
                          flexGrow: 1,
                          padding: '16px',
                          borderRadius: '8px',
                          borderColor: accountType === 'recruiter' ? theme.palette.primary.main : theme.palette.grey[400],
                          borderWidth: accountType === 'recruiter' ? '2px' : '1px',
                          color: accountType === 'recruiter' ? theme.palette.primary.main : theme.palette.text.secondary,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          backgroundColor: accountType === 'recruiter' ? 'rgba(255, 107, 0, 0.08)' : 'transparent',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            backgroundColor: 'rgba(255, 107, 0, 0.05)',
                          },
                        }}
                      >
                        <RecruiterIcon />
                        <Typography variant="subtitle1">Recruiter</Typography>
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <StyledButton
                        type="button"
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<ArrowBack />}
                        sx={{ width: '48%' }}
                      >
                        Back
                      </StyledButton>
                      <StyledButton
                        type="submit"
                        variant="contained"
                        sx={{ width: '48%' }}
                      >
                        Sign Up
                      </StyledButton>
                    </Box>
                  </motion.form>
                )}
              </>
            )}
          </AnimatePresence>

          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 3 }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <MuiLink
              component="button"
              variant="body2"
              onClick={toggleMode}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </MuiLink>
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <SocialIconButton aria-label="facebook">
              <Facebook />
            </SocialIconButton>
            <SocialIconButton aria-label="google">
              <Google />
            </SocialIconButton>
            <SocialIconButton aria-label="github">
              <GitHub />
            </SocialIconButton>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;