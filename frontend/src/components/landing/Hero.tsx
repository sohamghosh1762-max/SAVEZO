"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { FloatingBubbles } from "./FloatingBubbles"
import Link from "next/link";

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-[calc(100vh-68px)] flex flex-col justify-start items-center pt-20 md:pt-32 px-6 text-center overflow-hidden bg-background text-foreground transition-colors duration-300">

      {/* Immersive background image with glassy gradient overlays */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <Image 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000&q=80" 
          alt="Landing Background" 
          fill 
          className="object-cover opacity-25 mix-blend-luminosity duration-[20s] hover:scale-110 transition-transform"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background z-10" />
      </motion.div>

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20 z-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating 3D Likes, Hearts, Comments & Shares backdrop restricted to Hero section */}
      <FloatingBubbles height="h-full" />

      {/* Content (elevated to z-20 to float cleanly over bubbles and keep buttons clickable) */}
      <div className="relative z-20 max-w-4xl">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-primary/30 text-primary text-sm bg-background/50 backdrop-blur-sm"
        >
          ● AI-Powered Content Moderation Platform
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-foreground"
        >
          Social Media <br />
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Without Harm
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10"
        >
          Savezo uses advanced AI to detect deepfakes, inappropriate content,
          and mental health risks before they reach your feed — keeping
          communities genuinely safe.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >

          <Link href="/auth">
  <button
    className="
      px-8
      py-4
      rounded-xl
      bg-gradient-to-r
      from-blue-500
      to-cyan-500
      text-white
      font-semibold
    "
  >
    Get Started →
  </button>
</Link>

          {/* ✅ TRY AI DETECTION */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/detection")}
            className="border-border text-foreground hover:bg-muted px-8 py-6 rounded-xl bg-background/50 backdrop-blur-sm"
          >
            Try AI Detection
          </Button>

        </motion.div>

      </div>
    </section>
  )
}