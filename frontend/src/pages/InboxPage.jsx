import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Alert,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import { api, useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import MessagePlaceholder from '../../public/message-placeholder.svg'; // Assuming you have this

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [selectedConversation?.messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/conversations/');
      setConversations(response.data);

    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error.response?.data?.error || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read if they are from the other user in the selected conversation
    if (conversation.unread_count > 0) {
      const messagesToMark = conversation.messages.filter(
        msg => !msg.is_read && msg.sender.id === conversation.other_user.id
      );
      messagesToMark.forEach(msg => markMessageAsRead(msg.id, conversation.other_user.id));
    }
  };

  const markMessageAsRead = async (messageId, conversationPartnerId) => {
    try {
      await api.patch(`/messages/${messageId}/read/`);
      // Update the conversation in the list
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.other_user.id === conversationPartnerId) {
            const updatedMessages = conv.messages.map(msg =>
              msg.id === messageId ? { ...msg, is_read: true } : msg
            );
            const newUnreadCount = updatedMessages.filter(m => !m.is_read && m.sender.id === conversationPartnerId).length;
            return { ...conv, messages: updatedMessages, unread_count: newUnreadCount };
          }
          return conv;
        })
      );
      // Update selected conversation if it's the one being read
      if (selectedConversation && selectedConversation.other_user.id === conversationPartnerId) {
        setSelectedConversation(prevSelConv => ({
          ...prevSelConv,
          messages: prevSelConv.messages.map(msg => 
            msg.id === messageId ? { ...msg, is_read: true } : msg
          ),
          unread_count: Math.max(0, prevSelConv.unread_count - 1)
        }));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedConversation) {
      return;
    }

    // Explicitly check if other_user and other_user.id are present and valid
    if (!selectedConversation.other_user || 
        typeof selectedConversation.other_user.id === 'undefined' || 
        selectedConversation.other_user.id === null) {
      console.error("Cannot send reply: recipient user ID is missing or invalid in selectedConversation.", selectedConversation);
      setError("Failed to send message. Recipient information is missing. Please try selecting the conversation again or contact support if the issue persists.");
      return;
    }

    setSendingReply(true);
    setError(null);

    try {
      const response = await api.post('/send-message/', {
        recipient_id: selectedConversation.other_user.id,
        content: replyContent,
      });
      const newMessage = response.data;

      // Add the new message to the selected conversation
      setSelectedConversation(prevConv => ({
        ...prevConv,
        messages: [...prevConv.messages, newMessage],
        last_message_timestamp: new Date(newMessage.timestamp),
      }));

      // Update the main conversations list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.other_user.id === selectedConversation.other_user.id 
            ? { ...conv, messages: [...conv.messages, newMessage], last_message_timestamp: new Date(newMessage.timestamp) }
            : conv
        ).sort((a,b) => new Date(b.last_message_timestamp) - new Date(a.last_message_timestamp))
      );
      
      setReplyContent('');
    } catch (error) {
      console.error('Error sending reply:', error);
      const backendError = error.response?.data?.detail || error.response?.data?.error;
      setError(backendError || 'Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
      scrollToBottom(); 
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(45deg, #FF6B00, #FF8C00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Your Conversations
        </Typography>
      </motion.div>

      {error && !sendingReply && ( // Don't show general fetch error if sending reply fails
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Paper 
            elevation={0}
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255, 107, 0, 0.05)',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >              <Typography variant="h6">
                Conversations
              </Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress sx={{ color: '#FF6B00' }} />
              </Box>
            ) : conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <img src={MessagePlaceholder} alt="No messages" style={{ width: 100, height: 100, marginBottom: 2 }} />                <Typography>
                  No conversations yet. Start messaging with employers or students!
                </Typography>
              </Box>
            ) : (
              <List sx={{ overflowY: 'auto', flexGrow: 1, p:0 }}>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >                  {conversations.map((conv) => (
                    <motion.div key={conv.other_user.id} variants={itemVariants}>
                      <ListItem 
                        button 
                        onClick={() => handleSelectConversation(conv)}
                        selected={selectedConversation?.other_user.id === conv.other_user.id}
                        sx={{
                          backgroundColor: conv.unread_count > 0
                            ? 'rgba(255, 107, 0, 0.08)' 
                            : 'transparent',
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(255, 107, 0, 0.15) !important',
                            borderRight: '3px solid #FF6B00'
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(255, 107, 0, 0.05)',
                          },
                          pt: 1.5,
                          pb: 1.5,
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color="primary"
                            badgeContent={conv.unread_count}
                            invisible={!(conv.unread_count > 0)}
                            max={9}
                          >
                            <Avatar 
                              src={conv.other_user.profile_picture || undefined} 
                              alt={conv.other_user.profile_name}
                              sx={{ width: 48, height: 48 }}
                            />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle1" noWrap sx={{ fontWeight: conv.unread_count > 0 ? 600 : 500 }}>
                              {conv.other_user.profile_name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {conv.messages.length > 0 ? 
                                (conv.messages[conv.messages.length - 1].sender.id === user?.id ? "You: " : "") +
                                conv.messages[conv.messages.length - 1].content 
                                : "No messages yet"}
                            </Typography>
                          }
                        />
                        {conv.messages.length > 0 && (
                           <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'flex-start', pt: 0.5 }}>
                             {formatDistanceToNow(new Date(conv.last_message_timestamp), { addSuffix: true })}
                           </Typography>
                        )}
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </motion.div>
                  ))}
                </motion.div>
              </List>
            )}
          </Paper>
        </Grid>

        {/* Selected Conversation View */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2, 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {selectedConversation ? (
              <>
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255, 107, 0, 0.03)',
                  }}
                >                  <Avatar src={selectedConversation.other_user.profile_picture || undefined} alt={selectedConversation.other_user.profile_name} sx={{ mr: 2 }} />
                  <Typography variant="h6">{selectedConversation.other_user.profile_name}</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
                  {selectedConversation.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender.id === user?.id ? 'flex-end' : 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        <Paper 
                          elevation={1}
                          sx={{ 
                            p: 1.5, 
                            borderRadius: message.sender.id === user?.id 
                              ? '20px 20px 5px 20px' 
                              : '20px 20px 20px 5px',
                            backgroundColor: message.sender.id === user?.id ? 'primary.main' : 'grey.200',
                            color: message.sender.id === user?.id ? 'primary.contrastText' : 'text.primary',
                            maxWidth: '70%',
                            wordBreak: 'break-word',
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography 
                            variant="caption" 
                            display="block" 
                            sx={{ 
                              mt: 0.5, 
                              textAlign: 'right', 
                              color: message.sender.id === user?.id ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                            }}
                          >
                            {format(new Date(message.timestamp), 'p, MMM d')}
                          </Typography>
                        </Paper>
                      </Box>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
                  {error && sendingReply && ( // Show specific error for sending reply
                    <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                    disabled={sendingReply}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSendReply} disabled={sendingReply || !replyContent.trim()} color="primary">
                            {sendingReply ? <CircularProgress size={24} /> : <SendIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '20px' }
                    }}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', p:3 }}>
                <img src={MessagePlaceholder} alt="Select a conversation" style={{ width: 150, height: 150, marginBottom: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography>
                  Choose a conversation from the list to see messages or start a new one.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InboxPage;
