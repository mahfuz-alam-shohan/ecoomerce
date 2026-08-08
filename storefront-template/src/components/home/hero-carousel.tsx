'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeroSlide, ThemeConfig } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  slides: HeroSlide[];
  themeConfig: ThemeConfig;
}

export function HeroCarousel({ slides, themeConfig }: HeroCarouselProps) {
  const activeSlides = slides?.filter((s) => s.isActive) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 border-b border-gray-200">
      {/* Background Banner Image with Gradient Overlay */}
      <div className="relative h-[420px] md:h-[540px] lg:h-[620px] w-full">
        {currentSlide.imageUrl && (
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70 transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/60 to-transparent" />

        {/* Text Content Block */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-center px-6 sm:px-10 lg:px-16 text-white space-y-6 max-w-2xl">
          {currentSlide.badgeText && (
            <span
              className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit shadow-sm"
              style={{
                backgroundColor: themeConfig.primaryColor || '#3b82f6',
                color: '#ffffff',
              }}
            >
              {currentSlide.badgeText}
            </span>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {currentSlide.title}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed font-normal max-w-xl">
            {currentSlide.subtitle}
          </p>

          <div className="pt-2">
            <Link
              href={currentSlide.buttonUrl || '/catalog'}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold shadow-xl transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: themeConfig.primaryColor || '#3b82f6',
                color: '#ffffff',
              }}
            >
              {currentSlide.buttonText || 'Shop Now'}
            </Link>
          </div>
        </div>

        {/* Slide Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Dots Indicator */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
