"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface GlobeProps {
  className?: string;
  data?: {
    lat: number;
    lng: number;
    value: number;
    label?: string;
  }[];
  showGlobe?: boolean;
  globeColor?: string;
  pointColor?: string;
  backgroundColor?: string;
}

export function Globe({
  className,
  data = [],
  showGlobe = true,
  globeColor = "#A93D10",
  pointColor = "#C24816",
  backgroundColor = "#000014",
}: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Simple CSS-based globe for now
    setIsLoaded(true);

    return () => {
      // Cleanup function
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div
        ref={mountRef}
        className="relative w-full h-full overflow-hidden rounded-full"
        style={{ backgroundColor }}
      >
        {/* CSS-based Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          {/* Globe Background */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${globeColor}80, ${globeColor}40, ${globeColor}20)`,
              boxShadow: `inset 0 0 50px rgba(59, 130, 246, 0.5)`,
            }}
          />

          {/* Globe Lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Longitude lines */}
            {[...Array(8)].map((_, i) => (
              <motion.ellipse
                key={`longitude-${i}`}
                cx="50"
                cy="50"
                rx={25 + i * 3}
                ry="50"
                fill="none"
                stroke={globeColor}
                strokeWidth="0.2"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: i * 0.1 }}
              />
            ))}

            {/* Latitude lines */}
            {[...Array(5)].map((_, i) => (
              <motion.ellipse
                key={`latitude-${i}`}
                cx="50"
                cy="50"
                rx="50"
                ry={10 + i * 10}
                fill="none"
                stroke={globeColor}
                strokeWidth="0.2"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 + i * 0.1 }}
              />
            ))}
          </svg>

          {/* Data Points */}
          {data.map((point, index) => (
            <motion.div
              key={index}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: pointColor,
                left: `${50 + (point.lng / 180) * 40}%`,
                top: `${50 - (point.lat / 90) * 40}%`,
                boxShadow: `0 0 10px ${pointColor}`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.5 }}
            >
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: pointColor }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          ))}

          {/* Rotation Animation */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${globeColor}20 60deg, transparent 120deg)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </div>
  );
} 