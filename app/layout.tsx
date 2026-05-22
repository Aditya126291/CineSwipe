import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineSwipe - Swipe & Match Movies with Friends in Real-Time",
  description: "Swipe popular movies and web series solo or join real-time multiplayer lobbies to match on titles together with friends. Ranks matches by matching speed!",
  keywords: ["movie matcher", "tinder for movies", "cineswipe", "movie night planner", "watch party", "popcorn party", "real-time swipe", "web series swipe"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineSwipe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white font-sans">{children}</body>
    </html>
  );
}
