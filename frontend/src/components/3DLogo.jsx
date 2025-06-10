import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, useTexture } from '@react-three/drei';
import { motion } from 'framer-motion';
import { deviceCapabilities } from '../utils/deviceCapabilities';
import { performanceMonitor } from '../utils/performanceMonitor';

// Fallback 2D Logo Component
const FallbackLogo = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    style={{
      width: 120,
      height: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      borderRadius: '50%',
      background: '#FFFFFF',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    }}
  >
    <img 
      src="/logo.svg" 
      alt="Jobify Logo" 
      style={{ 
        width: '70%',
        height: '70%', 
        objectFit: 'contain',
      }} 
    />
  </motion.div>
);

// 3D Logo Component
const Logo3D = ({ mousePosition }) => {
  const [hovered, setHovered] = useState(false);
  const [modelError, setModelError] = useState(false);
  
  // Try to load the 3D model, fall back to 2D if it fails
  const { nodes, materials } = useGLTF('/logo.glb').catch(() => {
    setModelError(true);
    return { nodes: null, materials: null };
  });

  if (modelError || !nodes || !materials) {
    return <FallbackLogo />;
  }

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <mesh
        geometry={nodes.logo.geometry}
        material={materials.logo}
        rotation={[0, mousePosition.x * 0.01, 0]}
      />
    </group>
  );
};

// Main Logo Component with Fallback
const Logo = ({ mousePosition }) => {
  const [shouldUse3D, setShouldUse3D] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check device capabilities
    const capabilities = deviceCapabilities.getCapabilities();
    setShouldUse3D(capabilities.shouldUse3D());

    // Start performance monitoring
    performanceMonitor.startMonitoring();

    // Listen for performance warnings
    const handlePerformanceWarning = (event) => {
      if (event.detail.type === 'fps' && event.detail.value < 30) {
        setShouldUse3D(false);
      }
    };

    window.addEventListener('performanceWarning', handlePerformanceWarning);

    return () => {
      performanceMonitor.stopMonitoring();
      window.removeEventListener('performanceWarning', handlePerformanceWarning);
    };
  }, []);

  if (error || !shouldUse3D) {
    return <FallbackLogo />;
  }

  return (
    <Suspense fallback={<FallbackLogo />}>
      <div style={{ width: 120, height: 120 }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Logo3D mousePosition={mousePosition} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </div>
    </Suspense>
  );
};

export default Logo; 