"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-100">
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Sem imagens disponíveis
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-primary/10 bg-slate-100">
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Imagem ${currentIndex + 1}`}
          fill
          priority={currentIndex === 0}
          className="cursor-zoom-in object-cover transition duration-500 ease-out hover:scale-105"
          onClick={() => setIsFullscreen(true)}
        />

        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-primary shadow-lg transition hover:bg-white"
              onClick={prevImage}
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-primary shadow-lg transition hover:bg-white"
              onClick={nextImage}
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary/90 px-4 py-1 text-xs font-semibold text-white shadow">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2 md:grid-cols-8">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition duration-300 ${
                index === currentIndex
                  ? "border-secondary ring-2 ring-secondary/30"
                  : "border-transparent hover:border-secondary/50"
              }`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} - Miniatura ${index + 1}`}
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6" role="dialog" aria-modal>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-6 top-6 rounded-full bg-white/90 text-primary hover:bg-white"
            onClick={() => setIsFullscreen(false)}
            aria-label="Fechar galeria"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="relative h-full w-full max-h-[90vh] max-w-5xl">
            <Image
              src={images[currentIndex]}
              alt={`${alt} - Imagem ampliada ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-primary hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  prevImage();
                }}
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-primary hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}
