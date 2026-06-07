"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type BubbleType = "like" | "heart" | "comment" | "share"

interface Bubble {
  id: number
  type: BubbleType
  size: number
  y: number
  duration: number
  delay: number
  bobAmplitude: number
  bobDuration: number
  direction: "ltr" | "rtl"
  opacity: number
  blur: number
  depth: "fg" | "bg"
}

interface FloatingBubblesProps {
  count?: number
  opacityMultiplier?: number
  className?: string
  height?: string
}

export function FloatingBubbles({
  count,
  opacityMultiplier = 1,
  className = "absolute top-0 left-0 right-0 overflow-hidden pointer-events-none select-none z-10",
  height,
}: FloatingBubblesProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    // Generate bubbles only on client side to avoid Next.js hydration issues
    const isMobile = window.innerWidth < 768
    const bubbleCount = count ?? (isMobile ? 12 : 32)
    const generated: Bubble[] = []
    const types: BubbleType[] = ["like", "heart", "comment", "share"]

    for (let i = 0; i < bubbleCount; i++) {
      const depth = Math.random() > 0.65 ? "fg" : "bg"
      const type = types[Math.floor(Math.random() * types.length)]
      
      // Foreground bubbles are larger; background bubbles are smaller
      const size = depth === "fg"
        ? Math.floor(Math.random() * 35) + 65   // 65px to 100px
        : Math.floor(Math.random() * 20) + 30   // 30px to 50px

      // Use negative delay to pre-populate the screen immediately on page load
      const duration = Math.random() * 15 + 18 // 18s to 33s
      const delay = Math.random() * -duration // negative delay covers the entire timeline

      generated.push({
        id: i,
        type,
        size,
        y: Math.random() * 88 + 6, // 6% to 94% vertical spread
        duration,
        delay,
        bobAmplitude: Math.random() * 20 + 10, // 10px to 30px bob range
        bobDuration: Math.random() * 4 + 4, // 4s to 8s bob speed
        direction: Math.random() > 0.5 ? "ltr" : "rtl",
        opacity: (depth === "fg" ? Math.random() * 0.25 + 0.45 : Math.random() * 0.15 + 0.2) * opacityMultiplier,
        blur: depth === "bg" ? (Math.random() > 0.5 ? 1.5 : 0.5) : 0,
        depth,
      })
    }

    setBubbles(generated)
  }, [count, opacityMultiplier])

  if (bubbles.length === 0) return null

  // Auto-detect height: use "h-full" if a localized count is passed, or default to covering under navbar to upper Features
  const finalHeight = height ?? (count ? "h-full" : "h-[140vh] md:h-[135vh]")

  return (
    <div className={`${className} ${finalHeight}`}>
      {bubbles.map((bubble) => {
        let radialGradient = ""
        let boxShadow = ""
        let hoverGlow = ""

        switch (bubble.type) {
          case "like":
            radialGradient = "radial-gradient(circle at 30% 30%, #60a5fa 0%, #2563eb 60%, #1d4ed8 100%)" // Blue
            boxShadow = "inset -3px -3px 8px rgba(0,0,0,0.4), inset 3px 3px 8px rgba(255,255,255,0.4), 0 10px 20px rgba(37,99,235,0.2)"
            hoverGlow = "brightness(1.1) drop-shadow(0 0 15px rgba(59,130,246,0.65))"
            break
          case "heart":
            radialGradient = "radial-gradient(circle at 30% 30%, #fb7185 0%, #f43f5e 60%, #be123c 100%)" // Red/Pink
            boxShadow = "inset -3px -3px 8px rgba(0,0,0,0.4), inset 3px 3px 8px rgba(255,255,255,0.4), 0 10px 20px rgba(244,63,94,0.2)"
            hoverGlow = "brightness(1.1) drop-shadow(0 0 15px rgba(244,63,94,0.65))"
            break
          case "comment":
            radialGradient = "radial-gradient(circle at 30% 30%, #c084fc 0%, #8b5cf6 60%, #6d28d9 100%)" // Violet
            boxShadow = "inset -3px -3px 8px rgba(0,0,0,0.4), inset 3px 3px 8px rgba(255,255,255,0.4), 0 10px 20px rgba(139,92,246,0.2)"
            hoverGlow = "brightness(1.1) drop-shadow(0 0 15px rgba(139,92,246,0.65))"
            break
          case "share":
            radialGradient = "radial-gradient(circle at 30% 30%, #34d399 0%, #059669 60%, #047857 100%)" // Emerald/Teal
            boxShadow = "inset -3px -3px 8px rgba(0,0,0,0.4), inset 3px 3px 8px rgba(255,255,255,0.4), 0 10px 20px rgba(5,150,105,0.2)"
            hoverGlow = "brightness(1.1) drop-shadow(0 0 15px rgba(5,150,105,0.65))"
            break
        }

        const bubbleStyle: React.CSSProperties = {
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          background: radialGradient,
          boxShadow: boxShadow,
        }

        return (
          <motion.div
            key={bubble.id}
            initial={{ 
              x: bubble.direction === "ltr" ? "-10%" : "110%", 
              y: `${bubble.y}%`,
              opacity: 0 
            }}
            animate={{
              x: bubble.direction === "ltr" ? ["-10vw", "110vw"] : ["110vw", "-10vw"],
              opacity: bubble.opacity,
            }}
            transition={{
              x: {
                duration: bubble.duration,
                repeat: Infinity,
                ease: "linear",
                delay: bubble.delay,
              },
              opacity: {
                duration: 1.5,
                ease: "easeOut",
              }
            }}
            style={{
              position: "absolute",
              zIndex: bubble.depth === "fg" ? 12 : 5,
              filter: bubble.blur > 0 ? `blur(${bubble.blur}px)` : undefined,
            }}
          >
            {/* Bobbing and rotation container */}
            <motion.div
              animate={{
                y: [0, -bubble.bobAmplitude, bubble.bobAmplitude, 0],
                rotate: bubble.direction === "ltr" ? [0, 360] : [360, 0],
              }}
              transition={{
                y: {
                  duration: bubble.bobDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: bubble.duration * 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }
              }}
              whileHover={{
                scale: 1.2,
                filter: hoverGlow,
              }}
              className="relative rounded-full flex items-center justify-center pointer-events-auto cursor-pointer transition-all duration-300 ease-out"
              style={bubbleStyle}
            >
              {/* Inner Gloss Shine Overlay */}
              <div 
                className="absolute top-1 left-1.5 rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none transform -rotate-12"
                style={{
                  width: `${bubble.size * 0.45}px`,
                  height: `${bubble.size * 0.3}px`,
                }}
              />

              {/* Icon rendering based on type */}
              {bubble.type === "like" && (
                <svg
                  className="w-[44%] h-[44%] text-white transform -rotate-12 drop-shadow-sm select-none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1zm20-8c0-.55-.45-1-1-1h-5.03l.63-3.8c.03-.2.02-.41-.04-.6l-1.07-3.21a1.002 1.002 0 0 0-1.78-.17L9.41 9.59c-.26.26-.41.62-.41.98v8.43c0 .55.45 1 1 1h8.22c.73 0 1.39-.4 1.73-1.05l2.83-5.66c.15-.31.23-.65.23-.99V12z" />
                </svg>
              )}

              {bubble.type === "heart" && (
                <svg
                  className="w-[46%] h-[46%] text-white drop-shadow-sm select-none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}

              {bubble.type === "comment" && (
                <svg
                  className="w-[44%] h-[44%] text-white drop-shadow-sm select-none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              )}

              {bubble.type === "share" && (
                <svg
                  className="w-[46%] h-[46%] text-white drop-shadow-sm select-none transform translate-x-[1px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
                </svg>
              )}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
