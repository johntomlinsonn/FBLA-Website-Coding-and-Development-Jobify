import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  GitHub, // Added GitHub icon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion'; // Import motion for the animated SVG
import MainLayout from '../components/MainLayout';

// Removed the BackgroundShape styled component
// const BackgroundShape = styled(Box)(({ theme, color, size, type, position, rotate }) => ({
//   position: 'absolute',
//   width: size || '150px',
//   height: size || '150px',
//   backgroundColor: color || 'rgba(0, 0, 0, 0.15)', // Slightly increased opacity for better visibility
//   borderRadius: type === 'wave' ? '50% 50% 50% 50% / 30% 30% 70% 70%' : '50%', // Simple wave or circle
//   opacity: 0.6,
//   filter: 'blur(40px)', // Apply blur
//   zIndex: 0, // Ensure shapes are behind the form
//   transform: rotate ? `rotate(${rotate})` : 'none',

//   // Positioning
//   ...(position === 'top-left' && { top: '10%', left: '5%' }),
//   ...(position === 'middle-left' && { top: '35%', left: '0%' }),
//   ...(position === 'middle-right-top' && { top: '20%', right: '5%', transform: 'rotate(30deg)' }),
//   ...(position === 'middle-right-bottom' && { top: '55%', right: '0%', transform: 'rotate(-20deg)' }),
//   ...(position === 'bottom-left' && { bottom: '5%', left: '10%' }),
//   ...(position === 'bottom-right' && { bottom: '10%', right: '15%', transform: 'rotate(45deg)' }),
// }));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2.5),
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary, // Adjusted for light theme
    transform: 'translate(14px, -9px) scale(0.75)',
    backgroundColor: theme.palette.background.paper, // Match paper background for light theme
    paddingLeft: '4px',
    paddingRight: '4px',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.background.paper, // Adjusted for light theme
    color: theme.palette.text.primary, // Adjusted for light theme
    '& fieldset': {
      borderColor: theme.palette.grey[400], // Standard border for light theme
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
    backgroundColor: theme.palette.primary.main, // Orange background from theme
    color: theme.palette.primary.contrastText, // White text from theme
    '&:hover': {
      backgroundColor: theme.palette.primary.dark, // Darker orange on hover from theme
    },
  }),
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  border: `1px solid ${theme.palette.grey[400]}`, // Adjusted for light theme
  color: theme.palette.text.secondary, // Adjusted for light theme
  '&:hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    backgroundColor: `rgba(${theme.palette.primary.main.match(/\d+/g).join(',')}, 0.05)`, // Slight orange tint on hover
  },
}));

// Animated SVG Logo component (extracted from Landing.jsx and slightly adapted)
const AnimatedLogo = () => {
  const heroSvgVariants = { // Keep animation variants if desired
    animate: {
      rotate: [0, 10, -10, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      variants={heroSvgVariants}
      animate="animate"
      style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }} // Added margin bottom
    >
      <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="orangeGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B00" />
            <stop offset="1" stopColor="#FFD6B0" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="url(#orangeGrad)" />
        <rect x="35" y="35" width="50" height="50" rx="12" fill="#fff" opacity="0.7" />
        <rect x="50" y="50" width="20" height="20" rx="5" fill="#FF6B00" />
      </svg>
    </motion.div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        // The redirect will be handled by the login function in AuthContext
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        // Replace with actual signup logic from AuthContext if available
        // await signup(formData.name, formData.username, formData.password);
        console.log('Registering...', formData); 
        alert('Registration successful! Please login.'); // Placeholder
        setIsLogin(true); // Switch to login form after registration
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please check your credentials.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', username: '', password: '', confirmPassword: '' });
  };

  // Password strength logic can be kept if desired for signup
  // const passwordStrength = (password) => { ... };
  // const strength = passwordStrength(formData.password);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 200px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='284' height='284' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23E9E4DE' stroke-width='8.7'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23FF6B00'%3E%3Ccircle cx='769' cy='229' r='7'/%3E%3Ccircle cx='539' cy='269' r='7'/%3E%3Ccircle cx='603' cy='493' r='7'/%3E%3Ccircle cx='731' cy='737' r='7'/%3E%3Ccircle cx='520' cy='660' r='7'/%3E%3Ccircle cx='309' cy='538' r='7'/%3E%3Ccircle cx='295' cy='764' r='7'/%3E%3Ccircle cx='40' cy='599' r='7'/%3E%3Ccircle cx='102' cy='382' r='7'/%3E%3Ccircle cx='127' cy='80' r='7'/%3E%3Ccircle cx='370' cy='105' r='7'/%3E%3Ccircle cx='578' cy='42' r='7'/%3E%3Ccircle cx='237' cy='261' r='7'/%3E%3Ccircle cx='390' cy='382' r='7'/%3E%3C/g%3E%3C/svg%3E")`,
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
          padding: theme.spacing(isLogin ? 4 : 3, 4),
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
            mx: 'auto'
        }}
      >
          <AnimatedLogo />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
          {isLogin ? 'Login' : 'Create Account'}
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {!isLogin && (
            <StyledTextField
              name="name"
              label="Name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                      <PersonOutline sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <StyledTextField
              name="username"
              label="Username"
              type="text"
              value={formData.username}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                    <PersonOutline sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                    <Lock sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                      sx={{ color: theme.palette.text.secondary }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {!isLogin && (
            <StyledTextField
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                      <Lock sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {isLogin && (
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={() => alert('Forgot password clicked')}
                sx={{
                    color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </MuiLink>
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 0, mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <StyledButton
            type="submit"
            variant="contained"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </StyledButton>

          {isLogin && (
            <Box sx={{ my: 3 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                or continue with
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <SocialIconButton aria-label="login with google">
                  <Google />
                </SocialIconButton>
                <SocialIconButton aria-label="login with github">
                  <GitHub />
                </SocialIconButton>
                <SocialIconButton aria-label="login with facebook">
                  <Facebook />
                </SocialIconButton>
              </Box>
            </Box>
          )}

            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 3 }}>
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
            <MuiLink
              component="button"
              variant="body2"
              type="button"
              onClick={toggleMode}
              sx={{
                cursor: 'pointer',
                  color: theme.palette.primary.main,
                fontWeight: 'bold',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {isLogin ? 'Register for free' : 'Sign In'}
            </MuiLink>
          </Typography>
        </form>
      </Paper>
      </Container>
    </Box>
  );
};

export default Login;