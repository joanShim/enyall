"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface DraggableCircleProps {
  text?: string;
  color?: string;
  className?: string;
}

export default function DraggableCircle({
  text = "개발중",
  color = "bg-red-500",
  className = "",
}: DraggableCircleProps) {
  const [position, setPosition] = useState({ x: -10, y: 50 });

  return (
    <motion.div
      className={`absolute z-50 flex h-20 w-20 items-center justify-center rounded-full border border-black ${color} ${className}`}
      style={{
        x: position.x,
        y: position.y,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        rotate: {
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        },
      }}
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        // Update position when drag ends
        setPosition((prevPosition) => ({
          x: prevPosition.x + info.offset.x,
          y: prevPosition.y + info.offset.y,
        }));
      }}
    >
      <p className="text-2xl text-white">{text}</p>
    </motion.div>
  );
}
