"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function MusicVideoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <button
          onClick={() => router.push('/')}
          className="mb-8 flex items-center gap-2 text-gothic-crimson hover:text-gothic-bloodRed transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <Card className="candle-glow">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-gothic text-gothic-crimson text-glow">
              Music Video Sneak Peak
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <video
              controls
              className="w-full max-w-3xl rounded-lg shadow-lg"
              preload="metadata"
            >
              <source src="/music-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </CardContent>
        </Card>

        {/* Decorative candles */}
        <div className="flex gap-4 justify-center mt-12">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-gothic-bloodRed rounded-full animate-candle-flicker candle-glow"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </motion.div>
    </main>
  );
}
