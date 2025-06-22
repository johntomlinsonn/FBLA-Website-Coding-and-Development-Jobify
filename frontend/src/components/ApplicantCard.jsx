import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Collapse,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MessageIcon from '@mui/icons-material/Message';
import WorkIcon from '@mui/icons-material/Work';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '../contexts/AuthContext';

const ApplicantCard = ({ applicant }) => {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({ applied: false, references: false });

  const handleExpandClick = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const {
    account_holder_name,
    profile_picture_url,
    email,
    school_year,
    graduation_year,
    skills = [],
    applied_jobs = [],
    references = [],
    gpa,
    school,
    status, // e.g., 'Available', 'Graduated', 'Interviewing'
    resume_url,
    currently_working,
  } = applicant;

  const name = account_holder_name || `${applicant.user?.first_name || ''} ${applicant.user?.last_name || ''}`.trim();

  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name ? name[0].toUpperCase() : '';
  };
  
  const statusColors = {
    Available: { bg: '#e8f5e9', text: '#4caf50' },
    Graduated: { bg: '#e3f2fd', text: '#2196f3' },
    Interviewing: { bg: '#fff3e0', text: '#ffa726' },
    Working: { bg: '#ffcdd2', text: '#c62828' },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleOpenMessageDialog = () => {
    setMessageDialogOpen(true);
    setMessageContent('');
    setMessageSent(false);
    setError(null);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setError('Message content cannot be empty');
      return;
    }

    setSendingMessage(true);
    setError(null);

    try {
      await api.post('/send-message/', {
        recipient_id: applicant.id,
        content: messageContent
      });
      setMessageSent(true);
      setTimeout(() => {
        handleCloseMessageDialog();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <>
      <motion.div variants={cardVariants} whileHover={{ y: -5 }} style={{height: '100%'}}>
        <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            p: 2
        }}>
          <CardContent>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                    src={profile_picture_url}
                    sx={{ width: 56, height: 56, mr: 2, bgcolor: '#ff6b00', color: 'white', fontWeight: 'bold' }}>
                    {getInitials(name)}
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{name}</Typography>
                    <Typography variant="body2" color="text.secondary">Class of {graduation_year || 'N/A'}</Typography>
                </Box>
                <Chip
                    label={currently_working ? 'Working' : (status || "Available")}
                    size="small"
                    sx={{
                        ml: 'auto',
                        bgcolor: currently_working
                            ? statusColors.Working.bg
                            : (statusColors[status]?.bg || statusColors.Available.bg),
                        color: currently_working
                            ? statusColors.Working.text
                            : (statusColors[status]?.text || statusColors.Available.text),
                        fontWeight: 'bold',
                    }}
                />
            </Box>

            {/* Details */}
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', my: 1 }}>
                <StarIcon fontSize="small" sx={{ mx: 1, color: '#ffc107' }}/>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>GPA {gpa || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', my: 1 }}>
                <SchoolIcon fontSize="small" sx={{ mr: 1 }}/>
                <Typography variant="body2">{school || "School not specified"}</Typography>
            </Box>

            {/* Skills */}
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Skills ({skills.length})</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.slice(0, 3).map((skill, index) => (
                    <Chip key={index} label={skill} size="small" sx={{ bgcolor: '#ffe0b2', color: '#e65100' }} />
                ))}
                {skills.length > 3 && <Chip label={`+${skills.length - 3}`} size="small" />}
              </Box>
            </Box>

            {/* Applied For */}
            <Box sx={{ my: 2 }}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleExpandClick('applied')}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Applied For ({applied_jobs.length})</Typography>
                    <IconButton size="small" sx={{transform: expanded.applied ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>
                <Collapse in={expanded.applied} timeout="auto" unmountOnExit>
                    {applied_jobs.length > 0 ? (
                      applied_jobs.map((job, index) => (
                         <Box key={index} sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 1}}>
                            <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2" noWrap>{job}</Typography>
                        </Box>
                      ))
                    ) : (
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>No recent applications</Typography>  
                    )}
                </Collapse>
            </Box>

            {/* References */}
            <Box sx={{ my: 2 }}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleExpandClick('references')}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>References ({references.length})</Typography>
                    <IconButton size="small" sx={{transform: expanded.references ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>
                <Collapse in={expanded.references} timeout="auto" unmountOnExit>
                    {references.length > 0 ? (
                        references.map((ref, index) => (
                            <Box key={index} sx={{mt: 1}}>
                                <Typography variant="body2" sx={{fontWeight: 500}}>{ref.name} - {ref.relation}</Typography>
                                <Typography variant="caption" color="text.secondary">{ref.contact}</Typography>
                            </Box>
                        ))
                    ) : (
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>No references provided</Typography>  
                    )}
                </Collapse>
            </Box>
          </CardContent>

          {/* Actions */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, px: 2, pb: 1 }}>
            <Button variant="outlined" startIcon={<VisibilityIcon />} href={resume_url} target="_blank" disabled={!resume_url} sx={{borderColor: '#ff6b00', color: '#ff6b00'}}>
              View Resume
            </Button>
            <Button variant="contained" startIcon={<MessageIcon />} onClick={handleOpenMessageDialog} sx={{bgcolor: '#ff6b00', '&:hover': {bgcolor: '#e65100'}}}>
              Message
            </Button>
          </Box>
        </Card>
      </motion.div>

      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Message to {name}</DialogTitle>
        <DialogContent>
          {messageSent ? (
            <Typography>Message sent successfully!</Typography>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                id="message"
                label="Message"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                error={!!error}
                helperText={error}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          {!messageSent && <Button onClick={handleSendMessage} disabled={sendingMessage} variant="contained">{sendingMessage ? 'Sending...' : 'Send'}</Button>}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicantCard;