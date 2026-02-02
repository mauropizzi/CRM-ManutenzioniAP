import React from 'react';
import "@/app/globals.css"; // Keep global styles
import { cn } from "@/lib/utils";

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "min-h-screen bg-white text-gray-900 print:bg-white print:text-black" // Apply print styles to this wrapper div
      )}
    >
      {children}
    </div>
  );
}