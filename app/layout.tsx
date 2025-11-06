import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { OnlinePlayersCount } from "@/components/OnlinePlayersCount";
import { BackButton } from "@/components/BackButton";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Submit a Song Idea",
  description: "Share your creative song ideas with us",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased pt-16">
        <AuthProvider>
          <BackButton />
          <OnlinePlayersCount />
          
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
