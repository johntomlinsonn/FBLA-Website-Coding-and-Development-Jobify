import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, keyframes, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ProfileCompletionBar from '../components/ProfileCompletionBar';
import BadgeDisplay from '../components/BadgeDisplay';
import ChallengeWidget from '../components/ChallengeWidget';
import Leaderboard from '../components/Leaderboard';
import { api } from '../contexts/AuthContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AnimatedBox = animated(Box);

// Keyframe animations for background and glow effects
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glowAnimation = keyframes`
  from { box-shadow: 0 0 5px #FF6B00, 0 0 10px #FF6B00; }
  to { box-shadow: 0 0 20px #FF8C00, 0 0 30px #FF8C00; }
`;

const Section = ({ title, children, delay = 0 }) => {
  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay,
  });

  return (
    <AnimatedBox style={props} sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mb: 2, letterSpacing: '1px' }}>
        {title}
      </Typography>
      {children}
    </AnimatedBox>
  );
};

const ChallengeCenter = () => {
  const [gamification, setGamification] = useState(null);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, challengesRes, leaderboardRes] = await Promise.all([
          api.get('/gamification/profile'),
          api.get('/gamification/challenges/'),
          api.get('/gamification/leaderboard/'),
        ]);
        
        const allChallenges = challengesRes.data;
        setActiveChallenges(allChallenges.filter(c => !c.is_completed));
        setCompletedChallenges(allChallenges.filter(c => c.is_completed));
        
        setGamification(profileRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (err) {
        // Optionally handle error
        console.error("Failed to fetch gamification data:", err);
      }
    };
    fetchAll();
  }, []);
  
  const headerProps = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 220, friction: 12 }
  });

  return (
    <Box sx={{
      background: '#FFFFFF',
      minHeight: '100vh',
      py: 5,
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <AnimatedBox style={headerProps} component={Paper} elevation={4} sx={{
          textAlign: 'center',
          mb: 6,
          py: 4,
          background: '#ffffff',
          borderRadius: '20px',
          border: '2px solid #FF6B00',
          boxShadow: '0 8px 24px -4px #FF6B0044'
        }}>
          <EmojiEventsIcon sx={{ fontSize: 72, color: '#FF6B00', mb: 1 }} />
          <Typography variant="h2" fontWeight={900} sx={{
            color: '#1a1a2e',
            letterSpacing: '2px',
          }}>
            Challenge Center
          </Typography>
          <Typography variant="h6" sx={{ color: '#555', fontWeight: 400 }}>
            Level up your future. Earn badges. Climb the ranks.
          </Typography>
        </AnimatedBox>

        <Grid container spacing={5}>
          <Grid item xs={12} md={5}>
            <Section title="Your Progress" delay={200}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: '15px', background: '#fff', border: '1px solid #FF6B0022' }}>
                  {gamification ? (
                    <>
                      <ProfileCompletionBar 
                        percentage={gamification.profile_completion || 0} 
                        points={gamification.points || 0}
                        level={gamification.level || 0}
                        animate 
                      />
                      <BadgeDisplay badges={gamification.badges || []} />
                    </>
                  ) : (
                    <Typography>Loading progress...</Typography>
                  )}
              </Paper>
            </Section>
            
            <Section title="Leaderboards" delay={400}>
               <Paper elevation={3} sx={{ p: 3, borderRadius: '15px', background: '#fff', border: '1px solid #FF6B0022' }}>
                  {leaderboard ? (
                     <Leaderboard data={leaderboard} />
                  ) : (
                    <Typography>Loading leaderboards...</Typography>
                  )}
              </Paper>
            </Section>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Section title="Quests" delay={600}>
                <Accordion defaultExpanded sx={{ background: 'transparent', boxShadow: 'none', border: '1px solid #FF6B0022', borderRadius: '15px', mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FF6B00' }} />}>
                        <Typography variant="h6" fontWeight="bold">Active Quests ({activeChallenges.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {activeChallenges.length > 0 ? (
                            <ChallengeWidget challenges={activeChallenges} />
                        ) : (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No active quests right now. Check back later!
                            </Typography>
                        )}
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ background: 'transparent', boxShadow: 'none', border: '1px solid #FF6B0022', borderRadius: '15px' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FF6B00' }} />}>
                        <Typography variant="h6" fontWeight="bold">Completed Quests ({completedChallenges.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {completedChallenges.length > 0 ? (
                            <ChallengeWidget challenges={completedChallenges} />
                        ) : (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                You haven't completed any quests yet. Keep going!
                            </Typography>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Section>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ChallengeCenter; 