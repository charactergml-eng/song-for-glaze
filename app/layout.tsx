import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gothic Lyrics Player",
  description: "A dark, gothic-themed lyrics player",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
