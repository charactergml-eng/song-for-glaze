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

  const handleBack = () => {
    // For affirmation pages, always go home to avoid loops
    if (pathname?.startsWith('/affirmations/')) {
      router.push('/');
    } else {
      router.back();
    }
  };

  return (
    <div className="absolute top-6 left-6 z-50">
      <Button
        onClick={handleBack}
        variant="outline"
        size="sm"
        className="gap-2 bg-gothic-black/80 backdrop-blur-sm border-gothic-darkRed shadow-lg hover:bg-gothic-black/90"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
    </div>
  );
}
