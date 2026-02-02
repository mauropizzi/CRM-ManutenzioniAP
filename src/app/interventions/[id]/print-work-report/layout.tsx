import React from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css"; // Keep global styles
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "min-h-screen bg-white text-gray-900 print:bg-white print:text-black" // Ensure white background for printing
        )}
      >
        {children}
      </body>
    </html>
  );
}