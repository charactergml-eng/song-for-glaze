"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

export default function RatePage() {
  const [rating, setRating] = useState("");
  const [wantsToComment, setWantsToComment] = useState(false);
  const [comment, setComment] = useState("");
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
          rating: rating,
          comment: wantsToComment ? comment : "No comment provided",
          to_email: process.env.NEXT_PUBLIC_EMAIL_TO || "",
        }
      );

      setIsSubmitted(true);
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
          <div className="text-6xl mb-8 animate-pulse">🖤</div>
          <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow">
            Thank you so much for listening.
          </h1>
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
        {/* Decorative header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow mb-4">
            Your Thoughts
          </h1>
          <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-gothic-bloodRed to-transparent" />
        </div>

        <Card className="candle-glow">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Rate Your Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Input */}
              <div className="space-y-2">
                <label
                  htmlFor="rating"
                  className="text-sm font-medium text-gothic-bone"
                >
                  Rate it out of 10
                </label>
                <Input
                  id="rating"
                  type="text"
                  placeholder="e.g., 10/10, 8, perfect 9/10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              {/* Comment Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comment-checkbox"
                  checked={wantsToComment}
                  onChange={(e) =>
                    setWantsToComment((e.target as HTMLInputElement).checked)
                  }
                />
                <label
                  htmlFor="comment-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Would you like to leave a comment?
                </label>
              </div>

              {/* Comment Textarea */}
              {wantsToComment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <label
                    htmlFor="comment"
                    className="text-sm font-medium text-gothic-bone"
                  >
                    Your Comment
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </motion.div>
              )}

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
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Decorative footer */}
        <div className="mt-8 flex gap-4 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-gothic-bloodRed rounded-full animate-candle-flicker candle-glow"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </motion.div>
    </main>
  );
}
