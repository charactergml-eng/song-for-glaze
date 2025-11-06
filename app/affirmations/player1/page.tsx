"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface AffirmationsData {
  player1_to_player2?: string;
  player2_to_player1?: string;
}

export default function Player1() {
  const router = useRouter();
  const [affirmations, setAffirmations] = useState<AffirmationsData>({});
  const [myMessage, setMyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch affirmations on mount
  useEffect(() => {
    fetchAffirmations();
  }, []);

  const fetchAffirmations = async () => {
    try {
      const response = await fetch('/api/affirmations');
      const data = await response.json();
      setAffirmations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching affirmations:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/affirmations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: 'player1',
          message: myMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSubmitted(true);
      setMyMessage("");
      // Refresh affirmations
      await fetchAffirmations();
    } catch (err) {
      console.error('Error submitting affirmation:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-2xl font-gothic text-gothic-crimson animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow">
            Your treat has been sent!
          </h1>
          <div className="flex gap-4 justify-center mt-8">
            <Button
              onClick={() => setIsSubmitted(false)}
              className="text-lg font-gothic"
            >
              Send Another
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="text-lg font-gothic"
            >
              Back to Home
            </Button>
          </div>
          <div className="flex gap-4 justify-center mt-8">
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl space-y-6"
      >
        <h1 className="text-3xl md:text-4xl font-gothic text-gothic-crimson text-glow text-center">
          Goddess
        </h1>

        {/* Display message from Player 2 if exists */}
        {affirmations.player2_to_player1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="candle-glow bg-gothic-crimson/10">
              <CardHeader>
                <CardTitle className="text-center text-xl">
                  Glazing from Slave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-center italic">
                  "{affirmations.player2_to_player1}"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Form to send message to Player 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="candle-glow">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                {affirmations.player2_to_player1
                  ? "Send a treat to slave's Glazing"
                  : "Send a Treat"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your treat here..."
                    value={myMessage}
                    onChange={(e) => setMyMessage(e.target.value)}
                    required
                    rows={6}
                    className="resize-none text-lg"
                  />
                </div>

                {error && (
                  <div className="text-gothic-crimson text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full text-lg font-gothic"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Treat"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Decorative candles */}
        <div className="flex gap-4 justify-center mt-8">
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
