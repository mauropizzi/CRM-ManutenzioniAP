"use client";

import React from 'react';

export const BrandingHero = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto p-8 sm:p-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105">
      {/* Sfondo astratto per un tocco moderno */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" fill="none" viewBox="0 0 100 100">
          <defs>
            <pattern id="pattern-circles" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#pattern-circles)" className="text-blue-400" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
          Antonelli & Zanni Refrigerazione
        </h1>
        <p className="text-xl sm:text-2xl font-light opacity-90 drop-shadow-md">
          Refrigerazione
        </p>
      </div>
    </div>
  );
};