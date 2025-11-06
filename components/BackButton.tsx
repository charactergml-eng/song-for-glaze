"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back button on home page or login page
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  return (
    <div className="fixed top-20 left-8 z-50">
      <Button
        onClick={() => router.back()}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
    </div>
  );
}
