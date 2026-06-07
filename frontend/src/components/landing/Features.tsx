"use client"

import { FloatingBubbles } from "./FloatingBubbles"
import { motion } from "framer-motion"

export function Features() {
  const features = [
    {
      title: "Deepfake Detection",
      desc: "AI-powered frame-level analysis to identify manipulated videos with confidence scoring.",
      icon: "🎭",
    },
    {
      title: "Explicit Content Filter",
      desc: "Pre-publication NSFW detection to prevent harmful or inappropriate uploads.",
      icon: "🚫",
    },
    {
      title: "Suicide Risk Prevention",
      desc: "AI-based self-harm content detection to protect vulnerable users.",
      icon: "🛡️",
    },
  ]

  return (
    <section className="py-24 px-6 bg-background text-foreground transition-colors duration-300">

      {/* HEADER WITH FLOATING BUBBLES */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-6xl mx-auto text-center mb-16 py-12 px-6 rounded-3xl border border-border/50 bg-card/25 backdrop-blur-[2px] overflow-hidden"
      >
        {/* Localized float backdrop with controlled bubble count */}
        <FloatingBubbles count={12} opacityMultiplier={0.75} />
        
        <div className="relative z-20">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Intelligent AI Moderation
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced machine learning models ensure safer digital ecosystems
            by preventing harmful media before it spreads.
          </p>
        </div>
      </motion.div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
            whileHover={{ 
              y: -6,
              scale: 1.015,
              borderColor: "rgba(37,99,235,0.45)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.12)"
            }}
            className="bg-card border border-border rounded-2xl p-8 hover:border-primary/40 transition duration-300 shadow-card cursor-pointer"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>

            <h3 className="text-xl font-semibold mb-3 text-foreground">
              {feature.title}
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

    </section>
  )
}