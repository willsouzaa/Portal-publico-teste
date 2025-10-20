"use client";

import { useState } from "react";

interface PhotoSliderProps {
  images: string[];
  empreendimentoNome: string;
}

export function PhotoSlider({ images, empreendimentoNome }: PhotoSliderProps) {
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
    <section className="bg-slate-50 py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-semibold text-primary-900 mb-2">Galeria do Empreendimento</h3>
          <p className="text-slate-600">{images.length} fotos do {empreendimentoNome}</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
            {/* Slider Container */}
            <div className="relative h-96 md:h-[500px]">
              <div 
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((src, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 relative">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Photo Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
            
            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentIndex ? 'border-primary' : 'border-transparent hover:border-primary'
                      }`}
                      onClick={() => goToImage(idx)}
                    >
                      <img 
                        src={src} 
                        alt={`Thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}