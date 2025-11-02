import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { OnlinePlayersCount } from "@/components/OnlinePlayersCount";

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
      <body className="antialiased">
        <OnlinePlayersCount />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
