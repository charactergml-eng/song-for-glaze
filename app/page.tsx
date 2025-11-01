"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow text-center mb-12">
          Choose Your Path
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Affirmations Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/affirmations')}>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Glazing/Treat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Start your day with a glaze or treat
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Song Idea Card */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/song-idea')}>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Song Idea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Share your creative song ideas
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Music Video Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/music-video')}>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Music Video Sneak Peak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Watch the exclusive music video
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
