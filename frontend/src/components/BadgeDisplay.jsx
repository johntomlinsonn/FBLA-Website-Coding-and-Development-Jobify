import React from 'react';
import { Box, Typography, Tooltip, Grid, Avatar } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const iconMap = {
  award: EmojiEventsIcon,
  star: StarIcon,
  fire: WhatshotIcon,
};

const AnimatedGrid = animated(Grid);

const Badge = ({ badge, index }) => {
  const [isHovered, setHovered] = React.useState(false);

  const trail = useSpring({
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: index * 100
  });

  const hoverSpring = useSpring({
    transform: isHovered ? 'translateY(-8px) scale(1.1)' : 'translateY(0px) scale(1)',
    config: { tension: 300, friction: 10 }
  });

  const IconComponent = iconMap[badge.icon] || EmojiEventsIcon;

  return (
    <AnimatedGrid
      item
      style={{...trail, ...hoverSpring}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Tooltip title={`${badge.name}: ${badge.description}`} arrow placement="top">
        <Avatar
          sx={{
            bgcolor: '#FF6B00',
            width: 64,
            height: 64,
            border: '3px solid #FFD700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(255, 107, 0, 0.5)',
            },
          }}
        >
          <IconComponent sx={{ color: 'white', fontSize: 36 }} />
        </Avatar>
      </Tooltip>
    </AnimatedGrid>
  );
};

const BadgeDisplay = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <Box sx={{ mt: 3, p: 2, textAlign: 'center', background: '#f5f5f5', borderRadius: '12px' }}>
        <Typography color="text.secondary">No badges earned yet. Complete quests to unlock them!</Typography>
      </Box>
    );
  }

  return (
    <Box mt={3}>
      <Grid container spacing={2} justifyContent="center">
        {badges.map((badge, idx) => (
          <Badge badge={badge} index={idx} key={badge.id} />
        ))}
      </Grid>
    </Box>
  );
};

export default BadgeDisplay; 