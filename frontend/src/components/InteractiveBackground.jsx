import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { deviceCapabilities } from '../utils/deviceCapabilities';
import { performanceMonitor } from '../utils/performanceMonitor';

// Static Background Component (Fallback)
const StaticBackground = () => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #FF6B00 0%, #FFD6B0 50%, #FFFFFF 100%)',
      zIndex: -1,
    }}
  />
);

// Particle Component
const Particle = ({ x, y, size, color }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      pointerEvents: 'none',
    }}
  />
);

// Main Interactive Background Component
const InteractiveBackground = ({ mousePosition }) => {
  const [particles, setParticles] = useState([]);
  const [shouldUseInteractive, setShouldUseInteractive] = useState(false);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Check device capabilities
    const capabilities = deviceCapabilities.getCapabilities();
    setShouldUseInteractive(
      capabilities.shouldUse3D() && 
      capabilities.performance !== 'low' &&
      !capabilities.shouldUseReducedMotion()
    );

    if (shouldUseInteractive) {
      initializeParticles();
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldUseInteractive]);

  const initializeParticles = () => {
    const newParticles = [];
    const particleCount = deviceCapabilities.getCapabilities().performance === 'high' ? 50 : 25;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        color: `rgba(255, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100)}, 0.5)`,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    setParticles(newParticles);
  };

  const startAnimation = () => {
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let { x, y, vx, vy } = particle;

          // Update position
          x += vx;
          y += vy;

          // Bounce off edges
          if (x < 0 || x > window.innerWidth) vx *= -1;
          if (y < 0 || y > window.innerHeight) vy *= -1;

          // Add subtle mouse influence
          if (mousePosition) {
            const dx = mousePosition.x - x;
            const dy = mousePosition.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 200) {
              const force = (200 - distance) / 200;
              vx -= (dx / distance) * force * 0.1;
              vy -= (dy / distance) * force * 0.1;
            }
          }

          return { ...particle, x, y, vx, vy };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  if (!shouldUseInteractive) {
    return <StaticBackground />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      <StaticBackground />
      {particles.map(particle => (
        <Particle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          size={particle.size}
          color={particle.color}
        />
      ))}
    </div>
  );
};

export default InteractiveBackground; 