"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  InputBase,
  IconButton,
  Avatar,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import WorkIcon from "@mui/icons-material/Work"
import SchoolIcon from "@mui/icons-material/School"
import GroupIcon from "@mui/icons-material/Group"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

// Enhanced floating animation variants
const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

const slideInVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const cardHoverVariants = {
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    transition: { duration: 0.3 },
  },
}

// Enhanced features with modern icons and descriptions
const features = [
  {
    icon: <WorkIcon sx={{ fontSize: 40, color: "#fff" }} />,
    title: "For Students",
    description:
      "Discover amazing job opportunities tailored for high school students. From part-time gigs to internships that kickstart your career!",
    color: "#FF6B35",
    bgGradient: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
  },
  {
    icon: <GroupIcon sx={{ fontSize: 40, color: "#fff" }} />,
    title: "For Employers",
    description:
      "Connect with motivated young talent. Post opportunities and find the perfect student candidates for your business.",
    color: "#4ECDC4",
    bgGradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
  },
  {
    icon: <SchoolIcon sx={{ fontSize: 40, color: "#fff" }} />,
    title: "For Schools",
    description:
      "Manage your school's job board with ease. Approve postings and help your students find their first professional experiences.",
    color: "#A8E6CF",
    bgGradient: "linear-gradient(135deg, #A8E6CF 0%, #7FCDCD 100%)",
  },
]

const testimonials = [
  {
    name: "Emma Rodriguez",
    image: "/placeholder.svg?height=80&width=80",
    quote:
      "Jobify helped me land my first job at a local café! The application process was so simple and I love earning my own money.",
    title: "High School Junior",
    color: "#FF6B35",
  },
  {
    name: "Marcus Chen",
    image: "/placeholder.svg?height=80&width=80",
    quote:
      "Found an amazing internship at a tech startup through Jobify. It's given me real-world experience and looks great on college applications!",
    title: "Senior, Future Engineer",
    color: "#4ECDC4",
  },
  {
    name: "Sophia Williams",
    image: "/placeholder.svg?height=80&width=80",
    quote:
      "The platform made it easy to balance work and school. I've gained confidence and valuable skills that will help me in college.",
    title: "FBLA President",
    color: "#A8E6CF",
  },
]

// Floating geometric shapes component
const FloatingShapes = () => (
  <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0 }}>
    {/* Large floating sphere */}
    <motion.div
      variants={floatingVariants}
      animate="animate"
      style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
        opacity: 0.1,
      }}
    />

    {/* Geometric diamond */}
    <motion.div
      variants={pulseVariants}
      animate="animate"
      style={{
        position: "absolute",
        top: "20%",
        right: "10%",
        width: 80,
        height: 80,
        background: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
        transform: "rotate(45deg)",
        opacity: 0.15,
      }}
    />

    {/* Floating ring */}
    <motion.div
      variants={floatingVariants}
      animate="animate"
      style={{
        position: "absolute",
        bottom: "20%",
        left: "15%",
        width: 100,
        height: 100,
        border: "8px solid #A8E6CF",
        borderRadius: "50%",
        opacity: 0.2,
      }}
    />

    {/* Small floating dots */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        variants={floatingVariants}
        animate="animate"
        style={{
          position: "absolute",
          top: `${20 + i * 15}%`,
          right: `${5 + i * 8}%`,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: `hsl(${180 + i * 30}, 70%, 60%)`,
          opacity: 0.3,
        }}
      />
    ))}
  </Box>
)

const Landing = () => {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/jobs?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Hero Section with Enhanced Design */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 4 },
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <FloatingShapes />

        {/* Animated cursor follower */}
        <motion.div
          animate={{
            x: mousePosition.x - 10,
            y: mousePosition.y - 10,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          style={{
            position: "fixed",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.3)",
            pointerEvents: "none",
            zIndex: 9999,
            display: isMobile ? "none" : "block",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ position: "relative", zIndex: 2 }}
        >
          {/* Animated Logo */}
          <motion.div
            variants={pulseVariants}
            animate="animate"
            style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255,107,53,0.3) 0%, rgba(247,147,30,0.3) 100%)",
                  zIndex: -1,
                },
              }}
            >
              <WorkIcon sx={{ fontSize: 60, color: "#fff" }} />
            </Box>
          </motion.div>

          <Typography
            variant={isMobile ? "h3" : "h1"}
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#fff",
              mb: 3,
              textShadow: "0 4px 8px rgba(0,0,0,0.3)",
              background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2.5rem", md: "4rem" },
            }}
          >
            Your First Job
            <br />
            <span style={{ color: "#FFD700" }}>Starts Here! 🚀</span>
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 5,
              maxWidth: 700,
              mx: "auto",
              fontWeight: 400,
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              lineHeight: 1.6,
            }}
          >
            Discover amazing opportunities, build your future, and take the first step toward your dream career. Join
            thousands of students already making their mark!
          </Typography>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ width: "100%", maxWidth: 600, margin: "0 auto 40px" }}
          >
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                borderRadius: "25px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                overflow: "hidden",
                bgcolor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                height: 64,
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <InputBase
                sx={{
                  ml: 4,
                  flex: 1,
                  fontSize: "1.2rem",
                  color: "#333",
                  fontWeight: 500,
                }}
                placeholder="Search for your dream job... 💼"
                inputProps={{ "aria-label": "search jobs" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <IconButton
                type="submit"
                sx={{
                  p: "16px",
                  bgcolor: "#FF6B35",
                  color: "#fff",
                  borderRadius: "0 25px 25px 0",
                  height: "100%",
                  width: 80,
                  "&:hover": {
                    bgcolor: "#E55A2B",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease",
                }}
                aria-label="search"
              >
                <SearchIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>
          </motion.div>

          {/* CTA Button */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                  color: "white",
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  borderRadius: "25px",
                  fontSize: "1.3rem",
                  boxShadow: "0 8px 25px rgba(255,107,53,0.4)",
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 35px rgba(255,107,53,0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={() => navigate("/signup")}
              >
                Start Your Journey ✨
              </Button>
            </motion.div>
          )}
        </motion.div>
      </Box>

      {/* Features Section with Enhanced Design */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: "relative" }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={slideInVariants}>
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 800,
                mb: 2,
                color: "#2D3748",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Why Choose Jobify? 🌟
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mb: 8,
                color: "#718096",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
              }}
            >
              We're here to make your job search journey exciting, simple, and successful!
            </Typography>
          </motion.div>

          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <motion.div variants={slideInVariants} whileHover="hover" custom={index}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: "20px",
                      border: "none",
                      background: "#fff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-10px)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                      },
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: "center", position: "relative" }}>
                      {/* Gradient background accent */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 6,
                          background: feature.bgGradient,
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mb: 3,
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: feature.bgGradient,
                          mx: "auto",
                          boxShadow: `0 8px 25px ${feature.color}40`,
                        }}
                      >
                        {feature.icon}
                      </Box>

                      <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 2, color: "#2D3748" }}>
                        {feature.title}
                      </Typography>

                      <Typography variant="body1" sx={{ color: "#718096", lineHeight: 1.7, fontSize: "1.1rem" }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: { xs: 6, md: 10 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontWeight: 800,
                mb: 6,
                color: "#fff",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)",
              }}
            >
              Join Our Growing Community 🎉
            </Typography>

            <Grid container spacing={4}>
              {[
                { number: "5,000+", label: "Students Connected", icon: "👥" },
                { number: "1,200+", label: "Jobs Posted", icon: "💼" },
                { number: "850+", label: "Success Stories", icon: "⭐" },
                { number: "200+", label: "Partner Companies", icon: "🏢" },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={stat.label}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Box sx={{ textAlign: "center", color: "#fff" }}>
                      <Typography variant="h6" sx={{ fontSize: "2rem", mb: 1 }}>
                        {stat.icon}
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stat.number}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              mb: 2,
              color: "#2D3748",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Success Stories 💫
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              mb: 8,
              color: "#718096",
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Hear from students who found their perfect opportunities through Jobify
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={testimonial.name}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "20px",
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: `3px solid ${testimonial.color}20`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                      borderColor: `${testimonial.color}40`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                      <FormatQuoteIcon sx={{ fontSize: 48, color: testimonial.color, opacity: 0.7 }} />
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        fontStyle: "italic",
                        mb: 3,
                        color: "#4A5568",
                        lineHeight: 1.7,
                        fontSize: "1.1rem",
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Avatar
                        src={testimonial.image}
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 2,
                          border: `3px solid ${testimonial.color}`,
                        }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#2D3748" }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: testimonial.color, fontWeight: 600 }}>
                          {testimonial.title}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
          py: { xs: 8, md: 12 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: "#fff",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Ready to Start Your Journey? 🚀
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 5,
                color: "rgba(255,255,255,0.9)",
                maxWidth: 500,
                mx: "auto",
                fontSize: { xs: "1.2rem", md: "1.4rem" },
              }}
            >
              Join thousands of students who have already found their perfect opportunities. Your dream job is just one
              click away!
            </Typography>

            {!user && (
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#fff",
                  color: "#FF6B35",
                  fontWeight: 700,
                  px: 6,
                  py: 2.5,
                  borderRadius: "25px",
                  fontSize: "1.3rem",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#f8f8f8",
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={() => navigate("/signup")}
              >
                Get Started Now! 🎯
              </Button>
            )}
          </motion.div>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing
