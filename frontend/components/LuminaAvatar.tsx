"use client";

import { motion } from "framer-motion";

interface LuminaAvatarProps {
  state: "idle" | "thinking" | "streaming";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function LuminaAvatar({ state, className = "", size = "md" }: LuminaAvatarProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-44 h-44",
  };

  const eyeSizes = {
    sm: "w-1 h-2",
    md: "w-1.5 h-3",
    lg: "w-2 h-5",
    xl: "w-3 h-6",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer Ambient Glow */}
      <motion.div
        animate={{
          scale: state === "thinking" ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: state === "thinking" ? [0.4, 0.8, 0.4] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: state === "thinking" ? 1 : 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-10%] rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-xl"
      />

      {/* Spinning Ring (Active when Thinking) */}
      <motion.div
        animate={{ rotate: state === "thinking" ? 360 : 0 }}
        transition={{ duration: 2, repeat: state === "thinking" ? Infinity : 0, ease: "linear" }}
        className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${
          state === "thinking" 
            ? "border-cyan-400/60 border-t-purple-500" 
            : "border-cyan-500/20"
        }`}
      />

      {/* Inner Glow Ring */}
      <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-cyan-900/50 to-purple-900/50 backdrop-blur-sm" />

      {/* Main Body */}
      <motion.div
        animate={{
          y: state === "idle" ? [0, -3, 0] : 0,
          scale: state === "streaming" ? [1, 1.03, 1] : 1,
        }}
        transition={{
          duration: state === "idle" ? 2.5 : 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 w-[65%] h-[65%] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center justify-center overflow-hidden"
      >
        {/* Inner Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />

        {/* Eyes */}
        <div className="relative flex items-center justify-center gap-[15%] w-full">
          {/* Left Eye */}
          <motion.div
            animate={{
              scaleY: state === "idle" ? [1, 0.15, 1] : state === "thinking" ? [1, 0.5, 1] : 1,
            }}
            transition={{
              duration: state === "idle" ? 3.5 : 0.3,
              repeat: Infinity,
              repeatDelay: state === "idle" ? 2.5 : 0,
              ease: "easeOut",
            }}
            className={`${eyeSizes[size]} bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]`}
          />
          {/* Right Eye */}
          <motion.div
            animate={{
              scaleY: state === "idle" ? [1, 0.15, 1] : state === "thinking" ? [1, 0.5, 1] : 1,
            }}
            transition={{
              duration: state === "idle" ? 3.5 : 0.3,
              repeat: Infinity,
              repeatDelay: state === "idle" ? 2.5 : 0,
              delay: 0.05,
              ease: "easeOut",
            }}
            className={`${eyeSizes[size]} bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]`}
          />
        </div>

        {/* Streaming Pulse Effect */}
        {state === "streaming" && (
          <motion.div
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="absolute inset-0 bg-white/20 rounded-2xl"
          />
        )}
      </motion.div>

      {/* Floating Particles */}
      <motion.div
        animate={{ y: [-8, 8, -8], x: [0, 3, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0 }}
        className="absolute top-0 right-[10%] w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[2px]"
      />
      <motion.div
        animate={{ y: [8, -8, 8], x: [0, -3, 0], opacity: [0, 0.8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-0 left-[10%] w-2 h-2 bg-purple-400 rounded-full blur-[2px]"
      />
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0, 0.6, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute top-[20%] left-0 w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
      />

      {/* Status Indicator Dot */}
      <motion.div
        animate={{
          scale: state === "streaming" ? [1, 1.3, 1] : 1,
          opacity: state === "idle" ? 0.6 : 1,
        }}
        transition={{ duration: 0.5, repeat: state === "streaming" ? Infinity : 0 }}
        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
          state === "idle" ? "bg-green-500" : state === "thinking" ? "bg-amber-400" : "bg-cyan-400"
        }`}
      />
    </div>
  );
}
