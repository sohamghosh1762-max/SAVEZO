"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FloatingBubbles } from "./FloatingBubbles"

export function CTA() {
  return (
    <section className="py-24 px-6 relative text-center bg-background text-foreground transition-colors duration-300 overflow-hidden">

      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-40" />

      {/* Floating 3D Likes, Hearts, Comments & Shares backdrop */}
      <FloatingBubbles height="h-full" count={12} opacityMultiplier={0.75} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-3xl mx-auto"
      >

        {/* Heading */}
        <h2 className="text-4xl font-bold mb-6 text-foreground">
          Build Safer Platforms With AI
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Integrate SentinelAI into your platform and prevent
          deepfakes, explicit content, and suicide-risk media
          before it reaches users.
        </p>

        {/* Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="inline-block"
        >
          <Button
            size="lg"
            className="bg-accent-gradient text-white hover:opacity-90 px-10 py-6 rounded-xl shadow-glow"
          >
            Start Protecting Now
          </Button>
        </motion.div>

      </motion.div>

    </section>
  )
}