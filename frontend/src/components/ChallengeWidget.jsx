import React from 'react';
import { Box, Typography, Grid, Paper, Chip, Avatar, LinearProgress } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const AnimatedPaper = animated(Paper);

const getStatusStyles = (userChallenge) => {
  if (userChallenge.is_completed) {
    return {
      borderColor: '#4caf50', // Green
      icon: <CheckCircleIcon fontSize="large" />,
      iconColor: '#4caf50',
    };
  }
  
  const progress = userChallenge.progress?.current || 0;
  if (progress > 0) {
    return {
      borderColor: '#ffc107', // Amber
      icon: <HourglassEmptyIcon fontSize="large" />,
      iconColor: '#ffc107',
    };
  }

  return {
    borderColor: '#FF6B00', // Orange
    icon: <RadioButtonUncheckedIcon fontSize="large" />,
    iconColor: '#FF6B00',
  };
};

const ChallengeCard = ({ userChallenge, index }) => {
  if (!userChallenge || !userChallenge.challenge) {
    return null;
  }

  const [isHovered, setHovered] = React.useState(false);
  
  const { challenge, progress } = userChallenge;
  const statusStyles = getStatusStyles(userChallenge);

  const hasProgress = progress && typeof progress.current === 'number' && typeof progress.target === 'number' && progress.target > 0;
  const progressPercent = hasProgress ? (progress.current / progress.target) * 100 : 0;

  const cardSpring = useSpring({
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
    boxShadow: isHovered ? '0px 8px 25px -5px rgba(0,0,0,0.2)' : '0px 4px 15px -5px rgba(0,0,0,0.1)',
  });

  const trail = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: index * 100,
  });

  return (
    <Grid item xs={12}>
        <AnimatedPaper
            style={{...trail, ...cardSpring}}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            elevation={3}
            sx={{
                p: 2.5,
                borderRadius: '16px',
                background: '#fff',
                borderLeft: `8px solid ${statusStyles.borderColor}`,
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: statusStyles.iconColor, width: 56, height: 56, color: '#fff' }}>
                    {statusStyles.icon}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">{challenge.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{challenge.description}</Typography>
                </Box>
            </Box>
            
            {hasProgress && !userChallenge.is_completed && (
                <Box sx={{ mt: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Progress</Typography>
                        <Typography variant="caption" fontWeight="bold" color="text.primary">
                            {progress.current} / {progress.target}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#FF6B00',
                            },
                        }}
                    />
                </Box>
            )}

            <Box display="flex" gap={1} alignItems="center" mt={2} justifyContent="flex-end">
                <Chip
                    label={`+${challenge.points} XP`}
                    sx={{
                        bgcolor: '#FF6B00',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                />
                {challenge.badge && (
                    <Chip
                        label={challenge.badge.name}
                        avatar={<Avatar sx={{ bgcolor: 'white' }}><EmojiEventsIcon sx={{ color: '#FF6B00' }} /></Avatar>}
                        sx={{
                            bgcolor: '#FFD700',
                            color: '#333',
                            fontWeight: 'bold',
                        }}
                    />
                )}
            </Box>
        </AnimatedPaper>
    </Grid>
  );
};

const ChallengeWidget = ({ challenges }) => {
  if (!challenges || challenges.length === 0) return null;
  
  return (
    <Grid container spacing={3}>
      {challenges.map((userChallenge, idx) => (
        <ChallengeCard userChallenge={userChallenge} index={idx} key={userChallenge.id} />
      ))}
    </Grid>
  );
};

export default ChallengeWidget; 