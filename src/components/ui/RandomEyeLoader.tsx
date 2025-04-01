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
  const [, setPositionIndex] = useState(0);

  // Eye properties
  const eyeSize = size;
  const pupilSize = size * 0.2;
  const eyeSpacing = -size * 0.25; // Negative value for overlap
  const maxPupilMovement = size * 0.15;

  // 미리 정의된 눈동자 이동 경로
  const positions = [
    { x: 0, y: 0 }, // 중앙
    { x: -maxPupilMovement, y: 0 }, // 왼쪽
    { x: 0, y: 0 }, // 중앙
    { x: maxPupilMovement, y: 0 }, // 오른쪽
    { x: 0, y: 0 }, // 중앙
    { x: 0, y: -maxPupilMovement * 0.7 }, // 위
    { x: 0, y: 0 }, // 중앙
    { x: 0, y: maxPupilMovement * 0.7 }, // 아래
    { x: 0, y: 0 }, // 중앙
  ];

  useEffect(() => {
    if (!loading) return;

    // 초기 위치 설정
    setPupilPosition(positions[0]);

    // 2초마다 다음 위치로 이동
    const intervalId = setInterval(() => {
      setPositionIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % positions.length;
        setPupilPosition(positions[nextIndex]);
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [loading]);

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
