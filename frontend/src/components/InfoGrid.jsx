import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './InfoGrid.css'
import { Typography, Box } from '@mui/material'

const InfoGrid = () => {
  const navigate = useNavigate()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [performanceMode, setPerformanceMode] = useState('high')

  // Performance monitoring and optimization
  useEffect(() => {
    // Detect device capabilities for performance optimization
    const detectPerformance = () => {
      const ua = navigator.userAgent
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      const isLowEnd = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2
      
      if (isMobile || isLowEnd) {
        setPerformanceMode('medium')
      }
      
      // Further reduce on very low-end devices
      if (navigator.deviceMemory && navigator.deviceMemory <= 1) {
        setPerformanceMode('low')
      }
    }
    
    detectPerformance()
  }, [])

  // Performance-optimized mouse tracking with throttling
  useEffect(() => {
    let animationFrame
    const handleMouseMove = (e) => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        setMousePosition({ 
          x: (e.clientX / window.innerWidth) * 100, 
          y: (e.clientY / window.innerHeight) * 100 
        })
      })
    }

    const handleScroll = () => {
      const element = document.querySelector('.info-grid')
      if (element) {
        const rect = element.getBoundingClientRect()
        const isInView = rect.top < window.innerHeight && rect.bottom > 0
        setIsVisible(isInView)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [])

  // Memoized cards data for performance
  const cards = useMemo(() => [
    {
      id: 'mission',
      title: 'Our Mission',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      text: 'Jobify connects high school students to local job opportunities through accessible design, modern tools, and a student-first mindset.',
      buttonText: 'Read More',
      link: '/about',
      stats: { number: '1,500+', label: 'Students' }
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: '❓',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      text: 'Learn how Jobify works, who can apply, how to post jobs, and answers to the most common student and employer questions.',
      buttonText: 'Go to FAQ',
      link: '/faq',
      stats: { number: '24/7', label: 'Support' }
    }
  ], [])

  const handleCardClick = (link) => {
    navigate(link)
  }


  return (
    <section className="info-grid" data-visible={isVisible} data-performance={performanceMode}>
      {/* Advanced SVG Graphics with Performance Optimization */}
      <svg 
        className="info-grid__svg-graphics" 
        viewBox="0 0 1200 800" 
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* High-Performance Gradient Definitions */}
          <radialGradient id="dynamicGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,107,0,0.3)" />
            <stop offset="100%" stopColor="transparent" />
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              values="0 600 400;360 600 400"
              dur="20s"
              repeatCount="indefinite"
            />
          </radialGradient>
          
          <linearGradient id="flowingLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)">
              <animate attributeName="stop-opacity" 
                values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="rgba(255,170,0,0.2)">
              <animate attributeName="stop-opacity" 
                values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgba(255,214,176,0.1)">
              <animate attributeName="stop-opacity" 
                values="0.1;0.25;0.1" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Performance-Optimized Filters */}
          <filter id="glassBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0"/>
          </filter>
        </defs>        {/* Dynamic Background Graphics */}
        <g className="bg-graphics" opacity={isVisible ? "1" : "0"}>
          {/* Floating Geometric Shapes - Reduced count for performance */}
          {performanceMode === 'high' && [...Array(6)].map((_, i) => (
            <circle
              key={`bg-circle-${i}`}
              cx={200 + i * 150}
              cy={200 + (i % 2) * 300}
              r={30 + i * 5}
              fill="url(#dynamicGlow)"
              className="floating-shape"
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.3}px)`,
                transformOrigin: 'center',
                transition: 'transform 0.1s ease-out'
              }}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={`0 ${200 + i * 150} ${200 + (i % 2) * 300};360 ${200 + i * 150} ${200 + (i % 2) * 300}`}
                dur={`${15 + i * 2}s`}
                repeatCount="indefinite"
              />            </circle>
          ))}
          
          {/* Medium performance mode - fewer elements */}
          {performanceMode === 'medium' && [...Array(3)].map((_, i) => (
            <circle
              key={`bg-circle-med-${i}`}
              cx={300 + i * 300}
              cy={250 + (i % 2) * 200}
              r={40}
              fill="url(#dynamicGlow)"
              className="floating-shape-simple"
            />
          ))}

          {/* Flowing Light Streams - Conditional rendering */}
          {performanceMode !== 'low' && (
            <path
              d="M0,400 Q300,200 600,400 T1200,400"
              stroke="url(#flowingLight)"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            >
              <animate
                attributeName="d"
                values="M0,400 Q300,200 600,400 T1200,400;M0,400 Q300,600 600,400 T1200,400;M0,400 Q300,200 600,400 T1200,400"
                dur="8s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </g>        {/* Interactive Particles - Performance optimized */}
        <g className="particle-system">
          {performanceMode === 'high' && [...Array(12)].map((_, i) => (
            <g key={`particle-${i}`}>
              <circle
                cx={100 + i * 90}
                cy={150 + (i % 3) * 200}
                r="1.5"
                fill="rgba(255,255,255,0.4)"
                filter="url(#glassBlur)"
              >
                <animate
                  attributeName="cy"
                  values={`${150 + (i % 3) * 200};${50 + (i % 3) * 200};${150 + (i % 3) * 200}`}
                  dur={`${6 + i % 4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.6;0"
                  dur={`${4 + i % 3}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}
          
          {/* Simplified particles for medium performance */}
          {performanceMode === 'medium' && [...Array(6)].map((_, i) => (
            <circle
              key={`particle-simple-${i}`}
              cx={150 + i * 180}
              cy={300}
              r="2"
              fill="rgba(255,255,255,0.3)"
              opacity="0.5"
            />
          ))}
        </g>
      </svg>

      {/* Enhanced Header with Graphics */}
      <Box className="info-grid__header">
        <div className="header-decoration">
          <div className="decorative-line" />
          <div className="decorative-dot" />
          <div className="decorative-line" />
        </div>
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            paddingBottom: '20px',
            position: 'relative',
            zIndex: 3,
            background: 'linear-gradient(135deg, #222 0%, #555 50%, #FF6B00 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Extra Info 📄
        </Typography>

        <div className="header-decoration">
          <div className="decorative-line" />
          <div className="decorative-dot" />
          <div className="decorative-line" />
        </div>      </Box>

      <div className="info-grid__container">
        <div className="info-grid__wrapper">
          {cards.map((card, index) => (
            <div 
              key={card.id} 
              className={`info-card info-card--${index + 1}`}
              style={{
                '--card-gradient': card.gradient,
              }}
              onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
            >
              {/* Enhanced Card Header with Icon */}
              <div className="info-card__header">
                <div className="info-card__icon" style={{ background: card.gradient }}>
                  {card.icon}
                </div>
                <div className="info-card__stats">
                  <span className="stats-number">{card.stats.number}</span>
                  <span className="stats-label">{card.stats.label}</span>
                </div>
              </div>

              <div className="info-card__image-container">
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="info-card__image"
                  loading="lazy"
                />
                {/* Overlay Graphics */}
                <div className="image-overlay">
                  <svg className="overlay-pattern" viewBox="0 0 100 100">
                    <defs>
                      <pattern id={`pattern-${card.id}`} patternUnits="userSpaceOnUse" width="20" height="20">
                        <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.2)"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#pattern-${card.id})`} />
                  </svg>
                </div>
              </div>

              <div className="info-card__content">
                <h3 className="info-card__title">{card.title}</h3>
                <p className="info-card__text">{card.text}</p>
                
                {/* Enhanced Button with Graphics */}
                <button 
                  className="info-card__button"
                  onClick={() => handleCardClick(card.link)}
                  aria-label={`${card.buttonText} - ${card.title}`}
                  style={{ background: card.gradient }}
                >
                  <span className="button-content">
                    {card.buttonText}
                    <span className="info-card__button-arrow">→</span>
                  </span>
                  <div className="button-ripple"></div>
                </button>
              </div>

              {/* Interactive Light Trail */}
              <div className="card-light-trail"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default InfoGrid
