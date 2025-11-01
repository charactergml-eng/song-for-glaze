"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AffirmationsSelect() {
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
          Choose Your Player
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Player 1 Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform"
              onClick={() => router.push('/affirmations/player1')}
            >
              <CardHeader>
                <div className="flex justify-center mb-4 text-6xl">
                    👸
                </div>
                <CardTitle className="text-center text-2xl">
                  Goddess
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  View and send treats
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Player 2 Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform"
              onClick={() => router.push('/affirmations/player2')}
            >
              <CardHeader>
                <div className="flex justify-center mb-4 text-6xl">
                    🧎‍♂️
                </div>
                <CardTitle className="text-center text-2xl">
                  Slave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  View and send glazing
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Back button and decorative candles */}
        <div className="mt-12">
          <button
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-gothic-crimson transition-colors mx-auto block mb-8"
          >
            ← Back to Home
          </button>

          <div className="flex gap-4 justify-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-gothic-bloodRed rounded-full animate-candle-flicker candle-glow"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
