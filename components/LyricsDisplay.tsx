"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LyricsDisplayProps {
  lyrics: string[];
  timestamps: number[];
  currentTime: number;
  isPlaying: boolean;
}

export function LyricsDisplay({
  lyrics,
  timestamps,
  currentTime,
  isPlaying,
}: LyricsDisplayProps) {
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

  useEffect(() => {
    if (!isPlaying) return;

    // Find the current lyric index based on current time
    let index = -1;
    for (let i = 0; i < timestamps.length; i++) {
      if (currentTime >= timestamps[i]) {
        index = i;
      } else {
        break;
      }
    }
    setActiveLyricIndex(index);
  }, [currentTime, timestamps, isPlaying]);

  return (
    <div className="w-full max-w-3xl mx-auto min-h-[400px] flex flex-col items-center justify-center py-8 px-4">
      <div className="relative w-full h-[500px]">
        <AnimatePresence mode="popLayout">
          {activeLyricIndex !== -1 && lyrics.map((lyric, index) => {
            const isActive = index === activeLyricIndex;
            const isPast = index < activeLyricIndex;
            const isFuture = index > activeLyricIndex;

            // Only show lyrics near the active one
            const shouldShow =
              index === activeLyricIndex ||
              index === activeLyricIndex - 1 ||
              index === activeLyricIndex + 1 ||
              index === activeLyricIndex + 2;

            if (!shouldShow) return null;

            // Calculate position relative to active lyric
            const relativePosition = index - activeLyricIndex;
            const yPosition = relativePosition * 120; // 120px gap between lyrics

            return (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: isActive ? 1 : isFuture ? 0.3 : 0.5,
                  y: yPosition,
                  scale: isActive ? 1.2 : 0.85,
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  layout: {
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                  opacity: {
                    duration: 0.4,
                  },
                  scale: {
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                  y: {
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  right: '0',
                  transformOrigin: 'center center',
                  willChange: 'transform, opacity'
                }}
                className={cn(
                  "text-center font-gothic text-3xl md:text-4xl lg:text-5xl w-full flex items-center justify-center",
                  isActive
                    ? "text-gothic-crimson text-glow"
                    : "text-gothic-bone/60"
                )}
              >
                {lyric}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {activeLyricIndex === -1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-2xl text-gothic-bone/40 font-gothic"
          >
            Press play to begin...
          </motion.div>
        )}
      </div>
    </div>
  );
}
