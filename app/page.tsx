"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [slaveRank, setSlaveRank] = useState<string>("slave");
  const [kingdomRules, setKingdomRules] = useState<string>("");

  // Load rank from blob on mount - MUST be before conditional returns
  useEffect(() => {
    const loadRank = async () => {
      try {
        const response = await fetch('/api/rank');
        if (response.ok) {
          const data = await response.json();
          setSlaveRank(data.rank || 'slave');
        }
      } catch (error) {
        console.error('Failed to load rank:', error);
      }
    };
    loadRank();
  }, []);

  // Load rules on mount - MUST be before conditional returns
  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await fetch('/api/kingdom-rules');
        if (response.ok) {
          const data = await response.json();
          if (data.rules && data.rules.trim()) {
            setKingdomRules(data.rules);
          }
        }
      } catch (error) {
        console.error('Failed to load rules:', error);
      }
    };
    loadRules();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-crimson text-glow">Loading...</div>
      </main>
    );
  }

  // Redirect will be handled by AuthProvider, but we can show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Logout button in same position as BackButton */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="gap-2 bg-gothic-black/80 backdrop-blur-sm border-gothic-darkRed shadow-lg hover:bg-gothic-black/90"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow text-center mb-4">Welcome to Goddess Batoul's Kingdom</h1>
      <div className="text-center mb-8">
        <p className="text-gothic-bone/80 text-lg">
          Logged in as: <span className="text-gothic-crimson font-bold">{user.role === 'Goddess' ? 'Goddess' : slaveRank}</span>
        </p>
      </div>

      {/* Kingdom Rules Display */}
      {/* {kingdomRules && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl mb-8"
        >
          <Card className="candle-glow border-gothic-crimson border-2">
            <CardHeader>
              <CardTitle className="text-center text-3xl text-gothic-crimson text-glow">
                Daily Reminder of Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gothic-darkGray/50 p-6 rounded-lg">
                <p className="text-gothic-bone whitespace-pre-wrap text-lg leading-relaxed">
                  {kingdomRules}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )} */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow text-center mb-12">
          Choose Your Path
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Affirmations Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/affirmations')}>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                 🧎🏻/👸🏻
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Glazing/Treat
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Song Idea Card */}
          {/* <motion.div
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
          </motion.div> */}

          {/* Music Video Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/music-video')}>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  🎵
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Music Video
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/chat')}>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  💬
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Chat
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Kingdom Rules Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/kingdom-rules')}>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  📜
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Kingdom Rules
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
