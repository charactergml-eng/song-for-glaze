"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function KingdomRules() {
  const router = useRouter();
  const { user } = useAuth();
  const [rules, setRules] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isGoddess = user?.role === 'Goddess';
  const canEdit = isGoddess;

  // Load existing rules when component mounts
  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await fetch('/api/kingdom-rules');
        if (response.ok) {
          const data = await response.json();
          if (data.rules) {
            setRules(data.rules);
          }
        }
      } catch (error) {
        console.error('Error loading rules:', error);
        setMessage("Failed to load existing rules.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rules.trim()) {
      setMessage("Please enter some rules before submitting.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch('/api/kingdom-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules: rules.trim() }),
      });

      if (response.ok) {
        setMessage("Rules saved successfully!");
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error || 'Failed to save rules'}`);
      }
    } catch (error) {
      setMessage("Failed to save rules. Please try again.");
      console.error('Error saving rules:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow text-center mb-12">
          Kingdom Rules
        </h1>

        <Card className="candle-glow">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {canEdit ? 'Set the Kingdom Rules' : 'Kingdom Rules'}
            </CardTitle>
            {!canEdit && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                View only - Only the Goddess can edit the Kingdom Rules
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder={isLoading ? "Loading existing rules..." : canEdit ? "Enter the kingdom rules here..." : ""}
                className="min-h-[200px] text-lg"
                disabled={isLoading || !canEdit}
                readOnly={!canEdit}
              />

              {message && (
                <p className={`text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                  {message}
                </p>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={isSaving || isLoading}
                >
                  {canEdit ? 'Cancel' : 'Back'}
                </Button>
                {canEdit && (
                  <Button
                    type="submit"
                    disabled={isSaving || isLoading}
                    className="w-full text-lg font-gothic"
                  >
                    {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Submit'}
                  </Button>
                )}
              </div>
            </form>
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
