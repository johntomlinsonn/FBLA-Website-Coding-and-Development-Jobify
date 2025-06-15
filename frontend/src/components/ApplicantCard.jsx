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
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { api } from '../contexts/AuthContext';

const ApplicantCard = ({ applicant }) => {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState(null);
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    skills: false,
    education: false,
    references: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const {
    account_holder_name,
    profile_picture_url, // Use profile_picture_url from serializer
    email,
    school_year,
    graduation_year,
    skills = [],
    applied_jobs = [],
    education = [],
    references = [],
    resume_url,
  } = applicant;
  const name = account_holder_name || `${applicant.user?.first_name || ''} ${applicant.user?.last_name || ''}`.trim();
  const profilePicture = profile_picture_url; // Use profile_picture_url

  // Helper function to get initials
  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return `${firstName[0]}`.toUpperCase();
    }
    if (lastName) {
      return `${lastName[0]}`.toUpperCase();
    }
    return ''; // Return empty if no name parts
  };

  const schoolYear = school_year;
  const graduationYear = graduation_year;
  const appliedJobs = applied_jobs;

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
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: 450, // Fixed height for consistency
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {/* Header Section - Fixed */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            minHeight: 100,
          }}
        >
          <Avatar
            src={profilePicture}
            alt={name}
            sx={{
              width: 56,
              height: 56,
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {!profilePicture && name && getInitials(applicant.user?.first_name, applicant.user?.last_name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
              {name}
            </Typography>
            {email && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {email}
              </Typography>
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
            >
              <PersonIcon sx={{ fontSize: 16 }} />
              {schoolYear} • Class of {graduationYear}
            </Typography>
          </Box>
        </Box>

        {/* Scrollable Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Skills Section */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Skills ({skills.length})
              </Typography>
              {skills.length > 3 && (
                <IconButton
                  size="small"
                  onClick={() => toggleSection('skills')}
                  sx={{ p: 0.5 }}
                >
                  {expandedSections.skills ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(expandedSections.skills ? skills : skills.slice(0, 3)).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 107, 0, 0.1)',
                    color: '#FF6B00',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
              {!expandedSections.skills && skills.length > 3 && (
                <Chip
                  label={`+${skills.length - 3} more`}
                  size="small"
                  variant="outlined"
                  onClick={() => toggleSection('skills')}
                  sx={{
                    borderColor: '#FF6B00',
                    color: '#FF6B00',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Applied Jobs Section */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Applied For ({appliedJobs.length})
            </Typography>
            <Box sx={{ maxHeight: 80, overflow: 'auto' }}>
              {appliedJobs.map((job, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    mb: 0.5,
                  }}
                >
                  • {job}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Education Section - Expandable */}
          {education.length > 0 && (
            <Box sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  pb: expandedSections.education ? 1 : 2,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => toggleSection('education')}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Education ({education.length})
                </Typography>
                <IconButton size="small" sx={{ p: 0.5 }}>
                  {expandedSections.education ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={expandedSections.education}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {education.map((edu, idx) => (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {edu.school_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Class of {graduationYear || edu.graduation_date?.split('-')[0]} • GPA: {edu.gpa}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* References Section - Expandable */}
          {references.length > 0 && (
            <Box>
              <Box 
                sx={{ 
                  p: 2, 
                  pb: expandedSections.references ? 1 : 2,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => toggleSection('references')}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  References ({references.length})
                </Typography>
                <IconButton size="small" sx={{ p: 0.5 }}>
                  {expandedSections.references ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={expandedSections.references}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {references.map((ref, idx) => (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {ref.name} - {ref.relation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ref.contact}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>

        {/* Actions Section - Fixed at bottom */}
        <Box sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(0, 0, 0, 0.05)', mt: 'auto' }}>
          {resume_url && (
            <Button
              fullWidth
              variant="outlined"
              href={resume_url}
              target="_blank"
              sx={{ 
                mb: 1, 
                fontSize: '0.85rem',
                py: 0.75,
                borderColor: '#FF6B00',
                color: '#FF6B00',
                '&:hover': {
                  borderColor: '#e65c00',
                  backgroundColor: 'rgba(255, 107, 0, 0.04)',
                }
              }}
            >
              View Resume
            </Button>
          )}
          <Button
            fullWidth
            variant="contained"
            startIcon={<MessageIcon sx={{ fontSize: '1rem' }} />}
            onClick={handleOpenMessageDialog}
            sx={{
              background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
              color: '#fff',
              fontWeight: 600,
              py: 0.75,
              fontSize: '0.85rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8C00, #FF6B00)',
              },
            }}
          >
            Message
          </Button>
        </Box>
      </Card>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          Message to {name}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          {messageSent ? (
            <Typography color="success.main" variant="body1">
              Message sent successfully!
            </Typography>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="Message"
              fullWidth
              multiline
              rows={4}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={sendingMessage}
              placeholder={`Write your message to ${name}...`}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog} disabled={sendingMessage}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={sendingMessage || messageSent} 
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8C00, #FF6B00)',
              },
            }}
          >
            {sendingMessage ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default ApplicantCard;