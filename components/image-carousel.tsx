'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageCarouselProps {
  images: { src: string; alt: string }[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext()
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious()
    }
  }

  return (
    <div className="group relative mx-auto max-w-3xl">
      {/* Image Container */}
      <div
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="min-w-full">
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-gray-950">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Always Visible */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full border-2 border-white/20 bg-black/60 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-blue-500/50 hover:bg-black/80 md:left-4"
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full border-2 border-white/20 bg-black/60 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-blue-500/50 hover:bg-black/80 md:right-4"
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-12 bg-blue-500 shadow-lg shadow-blue-500/50'
                  : 'w-3 bg-white/40 hover:w-6 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
