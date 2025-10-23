"use client";

import { useState } from "react";

interface CardPhotoSliderProps {
  images: string[];
  empreendimentoNome: string;
}

export function CardPhotoSlider({ images, empreendimentoNome }: CardPhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-full">
      {/* Slider Container */}
      <div className="relative h-full">
        <div 
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, idx) => (
            <div key={idx} className="w-full flex-shrink-0 relative h-full">
              <img 
                src={src} 
                alt={`${empreendimentoNome} - Foto ${idx + 1}`} 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-all duration-200 backdrop-blur-sm z-10"
              onClick={prevImage}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-all duration-200 backdrop-blur-sm z-10"
              onClick={nextImage}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Photo Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm z-10">
            {currentIndex + 1}/{images.length}
          </div>
        )}
        
        {/* Dot indicators */}
        {images.length > 1 && images.length <= 5 && (
          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => goToImage(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}