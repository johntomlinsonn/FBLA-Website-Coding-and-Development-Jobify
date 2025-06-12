import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
} from '@mui/material';
import { motion } from 'framer-motion';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';

const ApplicantCard = ({ applicant }) => {
  const {
    account_holder_name,
    profile_picture,
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
  const profilePicture = profile_picture;
  const schoolYear = school_year;
  const graduationYear = graduation_year;
  const appliedJobs = applied_jobs;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: '100%',
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
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Avatar
            src={profilePicture}
            alt={name}
            sx={{
              width: 64,
              height: 64,
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {name}
            </Typography>
            {email && (
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <PersonIcon sx={{ fontSize: 16 }} />
              {schoolYear} • Class of {graduationYear}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Top Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 107, 0, 0.1)',
                    color: '#FF6B00',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
             <Typography variant="subtitle2" color="text.secondary" gutterBottom>
               Applied For
             </Typography>
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {appliedJobs.map((job, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                  }}
                >
                  • {job}
                </Typography>
              ))}
            </Box>
          </Box>
        </CardContent>

        {/* Education Section */}
        {education.length > 0 && (
          <CardContent sx={{ borderTop: '1px solid #eee' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Education
            </Typography>
            {education.map((edu, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {edu.school_name} (Class of {graduationYear || edu.graduation_date?.split('-')[0]})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  GPA: {edu.gpa}
                </Typography>
              </Box>
            ))}
          </CardContent>
        )}
        {/* References Section */}
        {references.length > 0 && (
          <CardContent sx={{ borderTop: '1px solid #eee' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              References
            </Typography>
            {references.map((ref, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="body2">{ref.name} - {ref.relation}</Typography>
                <Typography variant="caption" color="text.secondary">Contact: {ref.contact}</Typography>
              </Box>
            ))}
          </CardContent>
        )}
        {/* Actions */}
        <Box sx={{ p: 2, pt: 0 }}>
          {resume_url && (
            <Button
              fullWidth
              variant="outlined"
              href={resume_url}
              target="_blank"
              sx={{ mb: 1 }}
            >
              View Resume
            </Button>
          )}
          <Button
            fullWidth
            variant="contained"
            startIcon={<MessageIcon />}
            sx={{
              background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
              color: '#fff',
              fontWeight: 600,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8C00, #FF6B00)',
              },
            }}
          >
            Message
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ApplicantCard;