'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoCarouselProps {
  videos: { id: string; title: string }[]
}

export function VideoCarousel({ videos }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1))
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
    <div className="group relative mx-auto max-w-5xl">
      {/* Video Container */}
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
          {videos.map((video, index) => (
            <div key={video.id} className="min-w-full">
              <div className="relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full rounded-2xl border border-white/10"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Always Visible */}
      {videos.length > 1 && (
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
      {videos.length > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-12 bg-blue-500 shadow-lg shadow-blue-500/50'
                  : 'w-3 bg-white/40 hover:w-6 hover:bg-white/70'
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
