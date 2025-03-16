"use client";

import { Badge } from "@/components/ui/badge";
import { Artist } from "@/types/artist";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function Favorites({ artists }: { artists: Artist[] }) {
  const [isAnimating, setIsAnimating] = useState(true);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <div className="w-full">
      <h3
        className="mb-2 flex items-center justify-center text-center font-medium"
        onClick={toggleAnimation}
      >
        <Heart
          fill="currentColor"
          size={14}
          className={isAnimating ? "animate-spin-y" : ""}
        />
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {artists.map((artist) => (
          <Badge key={artist.id} variant="outline">
            {artist.korean_name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
