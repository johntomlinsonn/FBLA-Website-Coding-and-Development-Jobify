import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Avatar,
    keyframes,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { useSpring, useSprings, animated } from '@react-spring/web';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const rankColors = {
  1: '#FFD700', // Gold
  2: '#C0C0C0', // Silver
  3: '#CD7F32'  // Bronze
};

const shineAnimation = keyframes`
  0% { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(200%) skewX(-20deg); }
`;

const AnimatedPaper = animated(Paper);

const LeaderboardList = ({ list, statKey }) => {
  const trail = useSprings(list.length, list.map((_, i) => ({
    from: { opacity: 0, transform: 'translateX(-50px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    delay: i * 100,
  })));

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={1.5}>
        {trail.map((props, index) => {
          const user = list[index];
          const rank = index + 1;
          const isTop3 = rank <= 3;

          return (
            <Grid item xs={12} key={user.id}>
              <AnimatedPaper
                style={props}
                elevation={isTop3 ? 4 : 2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: '12px',
                  background: isTop3 ? `linear-gradient(135deg, ${rankColors[rank]}22, #ffffff)` : '#fff',
                  border: `1px solid ${isTop3 ? rankColors[rank] : '#ddd'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 4px 15px ${isTop3 ? rankColors[rank] : '#FF6B00'}33`,
                  },
                  '&:hover .shine-effect': {
                     animation: `${shineAnimation} 1s forwards`,
                  },
                }}
              >
                <Box className="shine-effect" sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                  opacity: 0.5,
                }} />
                
                <Typography fontWeight="bold" sx={{ color: isTop3 ? rankColors[rank] : 'text.secondary', minWidth: '30px' }}>
                  #{rank}
                </Typography>

                {isTop3 && <EmojiEventsIcon sx={{ color: rankColors[rank], mr: 1.5, ml: 0.5 }} />}

                <Avatar src={user.profile_picture_url || user.profile_picture} sx={{ width: 40, height: 40, border: `2px solid ${isTop3 ? rankColors[rank] : '#eee'}` }} />
                
                <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary', ml: 2, flexGrow: 1 }}>
                  {user.user?.username || user.username}
                </Typography>

                <Typography variant="body1" fontWeight="bold" sx={{ color: '#FF6B00' }}>
                  {
                    statKey === 'profile_completion'
                      ? `${Math.round(user.profile_completion)}%`
                      : (user[statKey] || 0)
                  }
                </Typography>
              </AnimatedPaper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

const Leaderboard = ({ data }) => {
  if (!data) return null;
  const { applications = [], profile_completion = [], challenge_completers = [] } = data;

  const commonAccordionProps = {
    sx: {
      background: 'transparent',
      boxShadow: 'none',
      border: '1px solid #FF6B0022',
      borderRadius: '15px !important', // !important to override default accordion rounding
      mb: 1,
      '&:before': {
        display: 'none', // Removes the default top border on accordions
      },
    },
  };

  return (
    <Box>
      <Accordion {...commonAccordionProps}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FF6B00' }} />}>
          <Typography variant="h6" fontWeight={700}>Most Applications</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <LeaderboardList list={applications} statKey="num_applications" />
        </AccordionDetails>
      </Accordion>
      
      <Accordion {...commonAccordionProps}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FF6B00' }} />}>
          <Typography variant="h6" fontWeight={700}>Top Profile Completion</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <LeaderboardList list={profile_completion} statKey="profile_completion" />
        </AccordionDetails>
      </Accordion>

      <Accordion {...commonAccordionProps}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FF6B00' }} />}>
          <Typography variant="h6" fontWeight={700}>Challenge Champions</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <LeaderboardList list={challenge_completers} statKey="num_challenges_completed" />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Leaderboard; 