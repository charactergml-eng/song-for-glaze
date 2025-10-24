"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioSrc: string;
  onTimeUpdate: (currentTime: number) => void;
  onEnded: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function AudioPlayer({
  audioSrc,
  onTimeUpdate,
  onEnded,
  onPlayStateChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded();
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [onTimeUpdate, onEnded]);

  useEffect(() => {
    onPlayStateChange?.(isPlaying && !isLoading);
  }, [isPlaying, isLoading, onPlayStateChange]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Play/Pause Button */}
      <div className="flex justify-center">
        <Button
          onClick={togglePlayPause}
          size="lg"
          className="w-20 h-20 rounded-full text-xl font-gothic candle-glow hover:scale-105 transition-transform"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : isPlaying ? (
            "⏸"
          ) : (
            "▶"
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-2 w-full">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className={cn(
              "absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-4",
              "[&::-webkit-slider-thumb]:h-4",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-gothic-crimson",
              "[&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(220,20,60,0.8)]",
              "[&::-moz-range-thumb]:w-4",
              "[&::-moz-range-thumb]:h-4",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-gothic-crimson",
              "[&::-moz-range-thumb]:cursor-pointer",
              "[&::-moz-range-thumb]:border-0"
            )}
            style={{
              background: `linear-gradient(to right, #dc143c 0%, #dc143c ${
                (currentTime / duration) * 100
              }%, #3d1b1b ${(currentTime / duration) * 100}%, #3d1b1b 100%)`,
            }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-sm text-gothic-bone/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
