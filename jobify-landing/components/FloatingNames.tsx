"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface FloatingName {
  id: number
  name: string
  x: number
  y: number
  color: string
  isVisible: boolean
  animationPhase: "popping-in" | "visible" | "popping-out" | "hidden"
}

interface ExclusionZone {
  x: number
  y: number
  width: number
  height: number
}

export function FloatingNames() {
  const [names, setNames] = useState<FloatingName[]>([])
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const animationFrameRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)

  const namesList = [
    "Maya",
    "Tyler",
    "Zoe",
    "Jake",
    "Ava",
    "Noah",
    "Mia",
    "Ethan",
    "Sophia",
    "Liam",
    "Emma",
    "Mason",
    "Olivia",
    "Lucas",
    "Isabella",
    "Aiden",
  ]

  const colors = [
    "bg-gradient-to-r from-orange-300 to-red-400",
    "bg-gradient-to-r from-yellow-300 to-orange-400",
    "bg-gradient-to-r from-red-300 to-pink-400",
    "bg-gradient-to-r from-orange-400 to-yellow-400",
    "bg-gradient-to-r from-amber-300 to-orange-400",
    "bg-gradient-to-r from-rose-300 to-orange-400",
    "bg-gradient-to-r from-orange-300 to-amber-400",
    "bg-gradient-to-r from-yellow-400 to-red-400",
  ]

  // Define exclusion zones where names should not appear
  const getExclusionZones = useCallback((): ExclusionZone[] => {
    const zones: ExclusionZone[] = []

    // Header area (top 15% of screen)
    zones.push({ x: 0, y: 0, width: 100, height: 15 })

    // Main content area (center 60% width, 40% height)
    zones.push({ x: 20, y: 25, width: 60, height: 40 })

    // Bottom CTA area (bottom 20% of screen)
    zones.push({ x: 0, y: 80, width: 100, height: 20 })

    // Side margins for mobile (first 10% and last 10% on mobile)
    if (viewportSize.width < 768) {
      zones.push({ x: 0, y: 0, width: 15, height: 100 })
      zones.push({ x: 85, y: 0, width: 15, height: 100 })
    }

    return zones
  }, [viewportSize.width])

  // Check if a position overlaps with any exclusion zone
  const isPositionSafe = useCallback(
    (x: number, y: number, nameWidth = 8, nameHeight = 4): boolean => {
      const exclusionZones = getExclusionZones()

      for (const zone of exclusionZones) {
        // Check if the name would overlap with this exclusion zone
        if (x < zone.x + zone.width && x + nameWidth > zone.x && y < zone.y + zone.height && y + nameHeight > zone.y) {
          return false
        }
      }

      return true
    },
    [getExclusionZones],
  )

  // Check if position overlaps with existing visible names
  const checkNameCollision = useCallback(
    (x: number, y: number, excludeId?: number): boolean => {
      return names.some((name) => {
        if (name.id === excludeId || !name.isVisible) return false

        const distance = Math.sqrt(Math.pow(x - name.x, 2) + Math.pow(y - name.y, 2))
        return distance < 15 // Minimum distance between names
      })
    },
    [names],
  )

  const getRandomSafePosition = useCallback((): { x: number; y: number } => {
    let attempts = 0
    const maxAttempts = 50

    while (attempts < maxAttempts) {
      // Generate position with safe margins
      const x = Math.random() * 70 + 15 // 15-85% of screen width
      const y = Math.random() * 50 + 25 // 25-75% of screen height

      if (isPositionSafe(x, y) && !checkNameCollision(x, y)) {
        return { x, y }
      }

      attempts++
    }

    // Fallback to corners if no safe position found
    const fallbackPositions = [
      { x: 15, y: 20 },
      { x: 75, y: 20 },
      { x: 15, y: 70 },
      { x: 75, y: 70 },
    ]

    for (const pos of fallbackPositions) {
      if (isPositionSafe(pos.x, pos.y)) {
        return pos
      }
    }

    // Ultimate fallback
    return { x: 20, y: 30 }
  }, [isPositionSafe, checkNameCollision])

  // Update viewport size
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initial update
    if (typeof window !== "undefined") {
      updateViewportSize()
      window.addEventListener("resize", updateViewportSize)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateViewportSize)
      }
    }
  }, [])

  // Initialize names once viewport size is set and component is mounted
  useEffect(() => {
    if (viewportSize.width === 0 || isInitializedRef.current) return // Wait for viewport size to be set

    // Mark as initialized to prevent re-initialization
    isInitializedRef.current = true

    // Create initial names without positions first
    const initialNames = namesList.slice(0, 6).map((name, index) => ({
      id: index,
      name,
      x: 0, // Temporary position
      y: 0, // Temporary position
      color: colors[index % colors.length],
      isVisible: false,
      animationPhase: "hidden" as const,
    }))

    // Set names first
    setNames(initialNames)

    // Then in a separate effect, we'll position and animate them
  }, [viewportSize.width, namesList, colors])

  // Position and start animations after names are initialized
  useEffect(() => {
    if (names.length === 0) return

    // Position each name safely
    const positionedNames = names.map((name) => {
      const position = getRandomSafePosition()
      return {
        ...name,
        x: position.x,
        y: position.y,
      }
    })

    // Update with positioned names
    setNames(positionedNames)

    // Start animations with staggered delays
    positionedNames.forEach((name, index) => {
      setTimeout(() => {
        startNameCycle(name.id)
      }, index * 800) // 800ms delay between each name starting
    })

    // Cleanup any animation frames on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [names.length, getRandomSafePosition])

  const startNameCycle = useCallback(
    (nameId: number) => {
      // Pop in
      setNames((prev) =>
        prev.map((name) => (name.id === nameId ? { ...name, animationPhase: "popping-in", isVisible: true } : name)),
      )

      // After pop-in animation, set to visible
      const visibleTimeout = setTimeout(() => {
        setNames((prev) => prev.map((name) => (name.id === nameId ? { ...name, animationPhase: "visible" } : name)))

        // After being visible for a while, start pop-out
        const popOutTimeout = setTimeout(
          () => {
            setNames((prev) =>
              prev.map((name) => (name.id === nameId ? { ...name, animationPhase: "popping-out" } : name)),
            )

            // After pop-out animation, hide and move to new position
            const hideTimeout = setTimeout(() => {
              setNames((prev) => {
                // Get a new position for this name
                const newPosition = getRandomSafePosition()

                return prev.map((name) =>
                  name.id === nameId
                    ? {
                        ...name,
                        animationPhase: "hidden",
                        isVisible: false,
                        x: newPosition.x,
                        y: newPosition.y,
                      }
                    : name,
                )
              })

              // Start the cycle again after a short delay
              const restartTimeout = setTimeout(
                () => {
                  startNameCycle(nameId)
                },
                Math.random() * 1500 + 1000,
              ) // Random delay between 1-2.5 seconds

              return () => clearTimeout(restartTimeout)
            }, 300) // Pop-out animation duration

            return () => clearTimeout(hideTimeout)
          },
          Math.random() * 3000 + 2500,
        ) // Visible duration: 2.5-5.5 seconds

        return () => clearTimeout(popOutTimeout)
      }, 400) // Pop-in animation duration

      return () => clearTimeout(visibleTimeout)
    },
    [getRandomSafePosition],
  )

  const getAnimationClasses = (name: FloatingName) => {
    const baseClasses =
      "absolute px-3 py-2 rounded-full text-sm font-bold cursor-pointer pointer-events-auto transition-all duration-300 text-white shadow-lg z-10"

    switch (name.animationPhase) {
      case "popping-in":
        return `${baseClasses} animate-pop-in`
      case "visible":
        return `${baseClasses} animate-gentle-float hover:scale-110`
      case "popping-out":
        return `${baseClasses} animate-pop-out`
      case "hidden":
      default:
        return `${baseClasses} scale-0 opacity-0`
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {names.map((name) => (
        <div
          key={name.id}
          className={`${name.color} ${getAnimationClasses(name)}`}
          style={{
            left: `${name.x}%`,
            top: `${name.y}%`,
            transform: "translate(-50%, -50%)", // Center the element on its position
          }}
          onClick={() => {
            // Add click interaction - restart the cycle immediately
            startNameCycle(name.id)
          }}
        >
          {name.name}
        </div>
      ))}
    </div>
  )
}
