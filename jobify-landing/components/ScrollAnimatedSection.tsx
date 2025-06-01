"use client"

import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import type { ReactNode } from "react"

interface ScrollAnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "rotate" | "slide-up" | "slide-down"
  delay?: number
  duration?: number
}

export function ScrollAnimatedSection({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 0.8,
}: ScrollAnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  const getAnimationClasses = () => {
    const baseClasses = "transition-all ease-out"
    const durationClass = `duration-[${Math.round(duration * 1000)}ms]`
    const delayClass = delay > 0 ? `delay-[${Math.round(delay * 1000)}ms]` : ""

    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-y-8`
        case "fade-down":
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 -translate-y-8`
        case "fade-left":
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-x-8`
        case "fade-right":
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 -translate-x-8`
        case "scale":
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 scale-75`
        case "rotate":
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 rotate-12 scale-75`
        case "slide-up":
          return `${baseClasses} ${durationClass} ${delayClass} translate-y-full`
        case "slide-down":
          return `${baseClasses} ${durationClass} ${delayClass} -translate-y-full`
        default:
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-y-8`
      }
    }

    return `${baseClasses} ${durationClass} ${delayClass} opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0`
  }

  return (
    <div ref={ref} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  )
}
