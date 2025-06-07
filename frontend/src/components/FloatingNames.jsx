import React, { useEffect, useState, useRef } from "react"

// Floating name object
const NAMES_LIST = [
  "Recruiters",
  "Employers",
  "Students",
  "Companies",
  "Jobify",
  "Opportunities",
  "Careers",
  "Internships",
  "Part-Time",
  "Guidance",
  "FBLA",
  "Apply Now",
  "Get Hired",
  "Resume",
  "Interview",
  "Networking",
  "Success",
]

// Expanded and more varied color palette
const COLORS = [
  "#FF6B00", "#FFB300", "#FF3B3F", "#00B8D9", "#36B37E", "#8F00FF", "#FF5E62", "#FF8C00", "#FFAA00", "#00C2B2", "#FF4081", "#222",
  "#F67280", "#6C5B7B", "#355C7D", "#C06C84", "#F8B195", "#B5EAD7", "#E2F0CB", "#FFDAC1", "#B5A1E5", "#F7B32B", "#2D82B7", "#A1C349", "#F67280",
]

const getAlphaColor = (hex, alpha) => {
  if (hex.startsWith('#')) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return hex;
}

// Static, far-from-center positions (corners and far edges)
const SAFE_POSITIONS = [
  { x: 0.10, y: 0.10 }, // top left
  { x: 0.90, y: 0.07 }, // top right
  { x: 0.250, y: 0.45 }, // bottom left
  { x: 0.90, y: 0.90 }, // bottom right
  { x: 0.13, y: 0.80 }, // left center
  { x: 0.90, y: 0.60 }, // right center
  { x: 0.3, y: 0.30 }, // top center
  { x: 0.10, y: 0.40 }, // bottom center
  { x: 0.2, y: 1.0 }, // upper left
  { x: 0.82, y: 0.28 }, // upper right
  { x: 0.75, y: 0.5 }, // lower left
  { x: 0.82, y: 0.99 }, // lower right
]

function getStaticGradient(i, alpha = 0.8) {
  const color1 = getAlphaColor(COLORS[i % COLORS.length], alpha)
  const color2 = getAlphaColor(COLORS[(i + 3) % COLORS.length], alpha)
  const angle = 90 + i * 15
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`
}

const FloatingNames = () => {
  const [names, setNames] = useState([])
  const [heroSize, setHeroSize] = useState({ width: 0, height: 0 })
  const heroRef = useRef(null)
  const animationRef = useRef()

  // Measure hero area
  useEffect(() => {
    const hero = heroRef.current
    const updateSize = () => {
      const width = hero && hero.offsetWidth ? hero.offsetWidth : window.innerWidth
      const height = hero && hero.offsetHeight ? hero.offsetHeight : window.innerHeight * 0.99
      setHeroSize({ width, height })
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    const timeout = setTimeout(updateSize, 100)
    return () => {
      window.removeEventListener("resize", updateSize)
      clearTimeout(timeout)
    }
  }, [])

  // Assign names to safe positions, smaller and less on small screens
  useEffect(() => {
    if (!heroSize.width || !heroSize.height) return
    let maxNames = SAFE_POSITIONS.length
    if (heroSize.width < 500) {
      maxNames = 3
    } else if (heroSize.width < 900) {
      maxNames = 6
    }
    const initial = NAMES_LIST.slice(0, maxNames).map((name, i) => {
      const pos = SAFE_POSITIONS[i % SAFE_POSITIONS.length]
      const bg = getStaticGradient(i, 0.8)
      const baseX = pos.x
      const baseY = pos.y
      const speed = 0.22 + (i % 3) * 0.05 // deterministic
      const amplitude = 14 + (i % 4) * 2 // deterministic
      const offset = (i * Math.PI) / 6 // deterministic
      return {
        id: i,
        name,
        color: bg,
        baseX,
        baseY,
        speed,
        amplitude,
        offset,
        x: 0,
        y: 0,
      }
    })
    setNames(initial)
  }, [heroSize.width, heroSize.height])

  // Animate floating
  useEffect(() => {
    if (!names.length) return
    let start = null
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = (timestamp - start) / 1000
      setNames((prev) => {
        const width = heroSize.width || window.innerWidth
        const height = heroSize.height || window.innerHeight * 0.7
        return prev.map((n) => {
          const cx = n.baseX * width
          const cy = n.baseY * height
          const x = cx + Math.cos(elapsed * n.speed + n.offset) * n.amplitude
          const y = cy + Math.sin(elapsed * n.speed * 0.8 + n.offset) * n.amplitude * 0.7
          return { ...n, x, y }
        })
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [names.length, heroSize.width, heroSize.height])

  return (
    <div ref={heroRef} className="absolute inset-0 w-full h-full pointer-events-none select-none" style={{ zIndex: 2 }}>
      {names.map((n) => (
        <div
          key={n.id}
          style={{
            position: "absolute",
            left: n.x,
            top: n.y,
            transform: "translate(-50%, -50%)",
            background: n.color,
            color: "#fff",
            borderRadius: 9999,
            padding: "0.6em 1.2em",
            fontWeight: 700,
            fontSize: "0.95rem",
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
            whiteSpace: "nowrap",
            pointerEvents: "auto",
            border: "2px solid #fff",
            transition: "box-shadow 0.2s, transform 0.2s",
            cursor: "pointer",
            userSelect: "none",
            minWidth: 48,
            minHeight: 24,
            opacity: 0.92,
          }}
          onClick={() => {}}
        >
          {n.name}
        </div>
      ))}
    </div>
  )
}

export default FloatingNames

// Tailwind animations (add to your global CSS if not present):
// .animate-pop-in { @apply scale-0 opacity-0; animation: popIn 0.4s forwards; }
// .animate-gentle-float { animation: gentleFloat 4s ease-in-out infinite alternate; }
// .animate-pop-out { animation: popOut 0.3s forwards; }
// @keyframes popIn { to { transform: scale(1); opacity: 1; } }
// @keyframes gentleFloat { 0% { transform: translateY(0); } 100% { transform: translateY(-12px); } }
// @keyframes popOut { to { transform: scale(0); opacity: 0; } } 