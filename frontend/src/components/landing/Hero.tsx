"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

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

      {/* Content */}
      <div className="relative z-10 max-w-4xl">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-primary/30 text-primary text-sm bg-background/50 backdrop-blur-sm">
          ● AI-Powered Content Moderation Platform
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-foreground">
          Social Media <br />
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Without Harm
          </span>
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
          Savezo uses advanced AI to detect deepfakes, inappropriate content,
          and mental health risks before they reach your feed — keeping
          communities genuinely safe.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          {/* ✅ GET STARTED */}
          <Button
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="bg-accent-gradient text-white hover:opacity-90 px-8 py-6 rounded-xl"
          >
            Get Started →
          </Button>

          {/* ✅ TRY AI DETECTION */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/detection")}
            className="border-border text-foreground hover:bg-muted px-8 py-6 rounded-xl bg-background/50 backdrop-blur-sm"
          >
            Try AI Detection
          </Button>

        </div>

      </div>
    </section>
  )
}