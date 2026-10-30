import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shanghai Karate — Attendance & Student Management",
  description:
    "Official attendance and student management system for Shanghai Karate Dojo. Track classes, belt progress, and fee payments.",
  keywords: ["karate", "attendance", "dojo", "shanghai karate", "martial arts"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "64x64", type: "image/png" },
      { url: "/logo.png", sizes: "550x542", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-dojo-bg text-dojo-text font-outfit antialiased">
        {children}
      </body>
    </html>
  );
}
