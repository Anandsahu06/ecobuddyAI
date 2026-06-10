import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/app-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoBuddy AI | Your Gamified Carbon Tracker",
  description: "AI-powered, conversational carbon tracker with evolving seedling companion and micro-quests.",
  keywords: ["sustainability", "carbon footprint", "AI companion", "gamification", "eco-friendly", "Scope 3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-forest text-text-primary">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

