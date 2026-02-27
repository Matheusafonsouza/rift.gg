import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiftGG — League of Legends Esports Hub",
  description:
    "The definitive source for League of Legends esports. Scores, stats, player rankings, team profiles, and in-depth tournament coverage.",
  keywords: ["League of Legends", "LoL esports", "LCK", "LPL", "LEC", "LCS", "pro play", "stats"],
  openGraph: {
    title: "RiftGG",
    description: "League of Legends Esports Hub",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-void text-text-secondary antialiased">
        {children}
      </body>
    </html>
  );
}
