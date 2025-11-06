"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AffirmationsSelect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [slaveRank, setSlaveRank] = useState<string>("slave");

  // Load rank from blob on mount
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

  // Auto-redirect to the appropriate player page based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'Goddess') {
        router.push('/affirmations/player1');
      } else {
        router.push('/affirmations/player2');
      }
    }
  }, [user, router]);

  // Show loading while redirecting
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-gothic-crimson text-glow">Redirecting...</div>
    </main>
  );
}
