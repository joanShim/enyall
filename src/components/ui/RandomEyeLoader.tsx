"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RandomEyeLoaderProps {
  loading?: boolean;
  size?: number;
  color?: string;
}

export default function RandomEyeLoader({
  loading = true,
  size = 80,
}: RandomEyeLoaderProps) {
  // 하나의 공통 위치를 사용하여 두 눈동자를 연동
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });

  // Eye properties
  const eyeSize = size;
  const pupilSize = size * 0.2;
  const eyeSpacing = -size * 0.25; // Negative value for overlap
  const maxPupilMovement = size * 0.15;

  useEffect(() => {
    if (!loading) return;

    // Function to generate random pupil positions
    const generateRandomPosition = () => {
      // Random angle between 0 and 2π
      const angle = Math.random() * Math.PI * 2;

      // Random distance from center (up to maxPupilMovement)
      const distance = Math.random() * maxPupilMovement;

      // Calculate new position - both eyes will use this same position
      setPupilPosition({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    // Initial position
    generateRandomPosition();

    // Set interval to update positions every 2 seconds
    const intervalId = setInterval(() => {
      generateRandomPosition();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [loading, maxPupilMovement]);

  if (!loading) return null;

  return (
    <div className="relative">
      {/* Left eye */}
      <div
        className="absolute rounded-full border-4 border-black bg-[#7151FF]"
        style={{
          width: eyeSize,
          height: eyeSize,
          left: -eyeSize / 2 - eyeSpacing / 2,
          top: -eyeSize / 2,
        }}
      >
        <motion.div
          className="absolute rounded-full bg-black"
          style={{
            width: pupilSize,
            height: pupilSize,
          }}
          animate={{
            left: eyeSize / 2 - pupilSize / 2 + pupilPosition.x,
            top: eyeSize / 2 - pupilSize / 2 + pupilPosition.y,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 1.5,
          }}
        />
      </div>

      {/* Right eye */}
      <div
        className="absolute rounded-full border-4 border-black bg-[#7151FF]"
        style={{
          width: eyeSize,
          height: eyeSize,
          left: eyeSize / 2 + eyeSpacing / 2,
          top: -eyeSize / 2,
        }}
      >
        <motion.div
          className="absolute rounded-full bg-black"
          style={{
            width: pupilSize,
            height: pupilSize,
          }}
          animate={{
            left: eyeSize / 2 - pupilSize / 2 + pupilPosition.x,
            top: eyeSize / 2 - pupilSize / 2 + pupilPosition.y,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 1.5,
          }}
        />
      </div>

      {/* Invisible spacer for proper sizing */}
      <div
        style={{ width: eyeSize * 2 - Math.abs(eyeSpacing), height: eyeSize }}
      ></div>
    </div>
  );
}
