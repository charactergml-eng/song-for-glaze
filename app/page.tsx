"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

export default function Home() {
  const [songIdea, setSongIdea] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Initialize EmailJS with your public key
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "");

      // Send email using EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        {
          rating: songIdea,
          to_email: process.env.NEXT_PUBLIC_EMAIL_TO || "",
        }
      );

      setIsSubmitted(true);
      setSongIdea("");
    } catch (err) {
      console.error("Failed to send email:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="text-6xl mb-8 animate-pulse">🎵</div>
          <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow">
            GREAT IDEA! Your slave has started working on it!
          </h1>
          <Button
            onClick={() => setIsSubmitted(false)}
            className="mt-8 text-lg font-gothic"
          >
            Submit Another Idea
          </Button>
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
        className="w-full max-w-lg"
      >

        <Card className="candle-glow">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Share Your Song Idea
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Song Idea Textarea */}
              <div className="space-y-2">
                <Textarea
                  id="songIdea"
                  placeholder="Write here..."
                  value={songIdea}
                  onChange={(e) => setSongIdea(e.target.value)}
                  required
                  rows={8}
                  className="resize-none text-lg"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-gothic-crimson text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-lg font-gothic"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "DO IT NOW!"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
