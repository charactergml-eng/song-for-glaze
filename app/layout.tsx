import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
