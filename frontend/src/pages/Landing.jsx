"use client"

import React, { useState, useEffect } from "react"
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
import FloatingNames from "../components/FloatingNames"

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
      "Ironmen, discover job opportunities in Normal and beyond, tailored for NCHS students. From part-time gigs to internships that sharpen your skills and kickstart your career!",
    color: "#FF6B35",
    bgGradient: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
  },
  {
    icon: <GroupIcon sx={{ fontSize: 40, color: "#fff" }} />,
    title: "For Employers",
    description:
      "Connect with motivated young talent from Normal Community High School. Post opportunities and find the perfect student candidates to sharpen your team!",
    color: "#4ECDC4",
    bgGradient: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)",
  },
  {
    icon: <SchoolIcon sx={{ fontSize: 40, color: "#fff" }} />,
    title: "For Schools",
    description:
      "NCHS Guidance Department, manage your school's job board with ease. Approve postings and help your Ironmen find their first professional experiences, aligning with our mission of personal excellence!",
    color: "#A8E6CF",
    bgGradient: "linear-gradient(135deg, #FFAA00 0%, #FFD6B0 100%)",
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
    color: "#FF8C00",
  },
  {
    name: "Sophia Williams",
    image: "/placeholder.svg?height=80&width=80",
    quote:
      "The platform made it easy to balance work and school. I've gained confidence and valuable skills that will help me in college.",
    title: "FBLA President",
    color: "#FFAA00",
  },
]

const Landing = () => {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [fps, setFps] = useState(60)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Performance monitoring
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const checkFps = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(checkFps)
    }
    
    requestAnimationFrame(checkFps)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/jobs?search=${encodeURIComponent(search.trim())}`)
  }

  // Enhanced cursor effect
  const cursorVariants = {
    default: {
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
      transition: { type: "spring", stiffness: 500, damping: 28 }
    }
  }

  // Enhanced text animation variants
  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      rotateX: -90
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  }

  const highlightVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      rotate: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: 0.5
      }
    }
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
          minHeight: "60vh",
          width: "100%",
          background: "linear-gradient(135deg, #FF6B00 0%, #FFD6B0 50%, #FFFFFF 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 4 },
          textAlign: "center",
          overflow: "hidden",
          perspective: "1000px",
        }}
        style={{paddingTop: 32, height:895}}
      >
        <FloatingNames />

        {/* Enhanced cursor follower with multiple elements */}
        <motion.div
          variants={cursorVariants}
          animate="default"
          style={{
            position: "fixed",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(255, 107, 0, 0.5)",
            pointerEvents: "none",
            zIndex: 9999,
            display: isMobile ? "none" : "block",
          }}
        />
        <motion.div
          variants={cursorVariants}
          animate="default"
          style={{
            position: "fixed",
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid rgba(255, 107, 0, 0.3)",
            pointerEvents: "none",
            zIndex: 9998,
            display: isMobile ? "none" : "block",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={textVariants}
          style={{ position: "relative", zIndex: 2 }}
        >
          {/* Animated Logo with 3D effect */}
          <motion.div
            variants={pulseVariants}
            animate="animate"
            style={{ 
              display: "flex", 
              justifyContent: "center", 
              marginBottom: 32,
              transformStyle: "preserve-3d",
              perspective: "1000px"
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                borderRadius: "50%",
                background: "#FFFFFF",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transform: "translateZ(20px)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateZ(30px) rotateY(10deg)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.7)",
                  zIndex: -1,
                  filter: "blur(10px)",
                },
              }}
            >
              <img 
                src="/logo.svg" 
                alt="Jobify Logo" 
                style={{ 
                  width: "70%",
                  height: "70%", 
                  objectFit: "contain",
                }} 
              />
            </Box>
          </motion.div>

          {/* Enhanced Typography with letter animations */}
          <Typography
            variant={isMobile ? "h3" : "h1"}
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#222",
              mb: 3,
              textShadow: "0 4px 8px rgba(0,0,0,0.1)",
              background: "linear-gradient(135deg, #222 0%, #555 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2.5rem", md: "4rem" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <motion.div style={{ display: "flex", gap: "0.5rem" }}>
                {"Your Future,".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    style={{ display: "inline-block" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>
              <motion.div
                variants={highlightVariants}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  color: "#FF6B00",
                  transformOrigin: "center",
                }}
              >
                {"Starts Here Ironmen!".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    style={{ display: "inline-block" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              color: "#444",
              mb: 5,
              maxWidth: 700,
              mx: "auto",
              fontWeight: 400,
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              lineHeight: 1.6,
            }}
          >
            Normal Community High School students, discover opportunities tailored for you. Build your future, gain valuable experience, and take the first step toward your dream career as an Ironman!
          </Typography>

          {/* Enhanced Search Bar with 3D effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ 
              width: "100%", 
              maxWidth: 600, 
              margin: "0 auto 40px",
              transformStyle: "preserve-3d",
              perspective: "1000px"
            }}
          >
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                borderRadius: "30px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                overflow: "hidden",
                bgcolor: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(12px)",
                height: 68,
                border: "3px solid rgba(255,107,0,0.2)",
                transform: "translateZ(10px)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateZ(20px)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                },
              }}
            >
              <InputBase
                sx={{
                  ml: 4,
                  flex: 1,
                  fontSize: "1.3rem",
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
                  p: "18px",
                  bgcolor: "#FF6B00",
                  color: "#fff",
                  borderRadius: "0 30px 30px 0",
                  height: "100%",
                  width: 90,
                  "&:hover": {
                    bgcolor: "#E65C00",
                    transform: "scale(1.05) translateX(5px)",
                  },
                  transition: "all 0.4s ease",
                }}
                aria-label="search"
              >
                <SearchIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </Box>
          </motion.div>

          {/* Enhanced CTA Button with 3D effect */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: "linear-gradient(135deg, #FF8C00 0%, #FF6B00 100%)",
                  color: "white",
                  fontWeight: 700,
                  px: 7,
                  py: 2.5,
                  borderRadius: "30px",
                  fontSize: "1.4rem",
                  boxShadow: "0 10px 30px rgba(255,107,0,0.5)",
                  textTransform: "none",
                  transform: "translateZ(10px)",
                  transition: "all 0.4s ease",
                  "&:hover": {
                    transform: "translateZ(20px) translateY(-5px)",
                    boxShadow: "0 15px 45px rgba(255,107,0,0.7)",
                  },
                }}
                onClick={() => navigate("/signup")}
              >
                Start Your Journey ✨
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* SVG Wave Divider for Smooth Transition */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            width: "100%",
            zIndex: 10,
            lineHeight: 0,
          }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1440 80"
            width="100%"
            height="80"
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
              fill="#fff"
            />
          </svg>
        </Box>
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
                color: "#222",
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
                color: "#555",
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
                <motion.div variants={slideInVariants} whileHover="hover" custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: index * 0.2 }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: "25px",
                      border: "none",
                      background: "#fff",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: "0 25px 55px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <CardContent sx={{ p: 5, textAlign: "center", position: "relative" }}>
                      {/* Gradient background accent */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 8,
                          background: feature.bgGradient,
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mb: 4,
                          width: 90,
                          height: 90,
                          borderRadius: "50%",
                          background: feature.bgGradient,
                          mx: "auto",
                          boxShadow: `0 10px 30px ${feature.color}60`,
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { fontSize: 48, color: "#fff" } })}
                      </Box>

                      <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 2, color: "#222" }}>
                        {feature.title}
                      </Typography>

                      <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.8, fontSize: "1.15rem" }}>
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

      {/* Wave Divider for transition from Why Choose Jobify to Stats */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 60, md: 80 },
          zIndex: 2,
          background: "transparent",
          lineHeight: 0,
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 80"
          width="100%"
          height="80"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="statsWaveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFB366" />
              <stop offset="86%" stopColor="#FFF6ED" />
              <stop offset="100%" stopColor="#fff" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="url(#statsWaveGrad)"
          />
        </svg>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          width: "100%",
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, #FFB366 0%, #FFF6ED 60%, #fff 100%)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="md" sx={{ px: 2 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontWeight: 800,
              mb: { xs: 6, md: 10 },
              color: "#222",
              fontSize: { xs: "2.2rem", md: "3rem" },
              letterSpacing: "-0.02em",
              }}
            >
            Join the Ironmen Community{" "}
            <span role="img" aria-label="rocket">
              🚀
            </span>
            </Typography>
          <Grid
            container
            spacing={{ xs: 4, md: 0 }}
            justifyContent="center"
            alignItems="flex-start"
            sx={{
              maxWidth: 800,
              mx: "auto",
              mb: 2,
            }}
          >
              {[
              {
                emoji: "👥",
                number: "1,500+",
                label: "Students Connected",
              },
              {
                emoji: "💼",
                number: "400+",
                label: "Jobs Posted",
              },
              {
                emoji: "⭐",
                number: "250+",
                label: "Success Stories",
              },
              {
                emoji: "🏢",
                number: "30+",
                label: "Partner Companies",
              },
            ].map((stat) => (
              <Grid
                item
                xs={6}
                md={3}
                key={stat.label}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: { xs: 4, md: 0 },
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    fontSize: { xs: "2.2rem", md: "2.7rem" },
                    mb: 1,
                    lineHeight: 1,
                  }}
                  aria-label={stat.label + " icon"}
                >
                  {stat.emoji}
                      </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#222",
                    fontSize: { xs: "1.7rem", md: "2.1rem" },
                    mb: 0.5,
                  }}
                >
                        {stat.number}
                      </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#555",
                    fontSize: { xs: "1.05rem", md: "1.1rem" },
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                        {stat.label}
                      </Typography>
                </Grid>
              ))}
            </Grid>
        </Container>
      </Box>

      {/* Scallop Divider for transition from Stats to Success Stories */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "80px",
          marginBottom: "-1px",
          zIndex: 2,
          background: "transparent",
          lineHeight: 0,
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 80"
          width="100%"
          height="60"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <g>
            {Array.from({ length: 25 }).map((_, i) => (
              <circle
                key={i}
                cx={i * 60}
                cy="1"
                r="78"
                fill="#FFB366"
              />
            ))}
          </g>
        </svg>
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
              color: "#222",
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
              color: "#555",
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "1.1rem", md: "1.3rem" },
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
                transition={{ duration: 0.7, delay: index * 0.25 }}
                whileHover={{ y: -12, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
              >
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "20px",
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: `3px solid ${testimonial.color}40`,
                    transition: "all 0.4s ease",
                    "&:hover": {
                      borderColor: `${testimonial.color}60`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                      <FormatQuoteIcon sx={{ fontSize: 52, color: testimonial.color, opacity: 0.8 }} />
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        fontStyle: "italic",
                        mb: 3,
                        color: "#333",
                        lineHeight: 1.8,
                        fontSize: "1.15rem",
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Avatar
                        src={testimonial.image}
                        sx={{
                          width: 64,
                          height: 64,
                          mr: 3,
                          border: `4px solid ${testimonial.color}`,
                        }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#222" }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: testimonial.color, fontWeight: 600, fontSize: "1rem" }}>
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

      {/* Blob Transition for Success Stories to CTA */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 120, md: 180 },
          zIndex: 2,
          background: "transparent",
          lineHeight: 0,
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 180"
          width="100%"
          height="180"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="ctaBlobGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#F7931E" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 Q360,160 720,100 T1440,120 L1440,180 L0,180 Z"
            fill="url(#ctaBlobGrad)"
            fillOpacity="1"
          />
        </svg>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #FF6B00 0%, #F7931E 100%)",
          py: { xs: 10, md: 15 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 4,
                color: "#fff",
                textShadow: "0 5px 10px rgba(0,0,0,0.4)",
                fontSize: { xs: "2.8rem", md: "4rem" },
              }}
            >
              Ironmen, Ready to Launch Your Future? 🚀
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 6,
                color: "rgba(255,255,255,0.95)",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1.3rem", md: "1.5rem" },
              }}
            >
              Join fellow NCHS students who have already found their perfect opportunities. Your dream job is just one
              click away – let's sharpen your future!
            </Typography>

            {!user && (
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#fff",
                  color: "#FF6B00",
                  fontWeight: 800,
                  px: 8,
                  py: 3,
                  borderRadius: "30px",
                  fontSize: "1.5rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#f0f0f0",
                    transform: "translateY(-5px)",
                    boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.4s ease",
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