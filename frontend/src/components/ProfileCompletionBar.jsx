import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

const AnimatedTypography = animated(Typography);
const AnimatedBox = animated(Box);

const ProfileCompletionBar = ({ percentage, points, level, animate }) => {
  const { number: animatedPercentage } = useSpring({
    from: { number: 0 },
    to: { number: percentage },
    delay: 300,
    config: { tension: 120, friction: 60 },
    reset: animate,
  });

  const { number: animatedPoints } = useSpring({
    from: { number: 0 },
    to: { number: points },
    delay: 400,
    config: { tension: 120, friction: 60 },
    reset: animate,
  });
  
  const { number: animatedLevel } = useSpring({
    from: { number: 0 },
    to: { number: level },
    delay: 500,
    config: { tension: 120, friction: 60 },
    reset: animate,
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      {/* XP Bar */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Typography variant="subtitle1" color="text.primary" fontWeight="bold">Profile Completion</Typography>
        <Box sx={{ position: 'relative', height: '28px', background: '#e0e0e0', borderRadius: '14px' }}>
          <AnimatedBox
            sx={{
              height: '100%',
              background: 'linear-gradient(90deg, #ffc107, #FF6B00)',
              borderRadius: '14px',
            }}
            style={{ width: animatedPercentage.to(p => `${p}%`) }}
          />
          <AnimatedTypography
            variant="body2"
            fontWeight="bold"
            sx={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {animatedPercentage.to(p => `${Math.round(p)}%`)}
          </AnimatedTypography>
        </Box>
      </Box>

      {/* Points and Level */}
      <Box display="flex" justifyContent="space-around" width="100%">
        <Box textAlign="center">
          <AnimatedTypography component="span" variant="h5" color="#FF6B00" fontWeight="bold">
              {animatedPoints.to(p => Math.round(p))}
          </AnimatedTypography>
          <Typography variant="subtitle2" color="text.secondary">Total XP</Typography>
        </Box>
        <Box textAlign="center">
          <AnimatedTypography component="span" variant="h5" color="#FF6B00" fontWeight="bold">
              {animatedLevel.to(p => Math.round(p))}
          </AnimatedTypography>
          <Typography variant="subtitle2" color="text.secondary">Level</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileCompletionBar; 