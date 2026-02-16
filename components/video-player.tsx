'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Maximize, ExternalLink } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('')

  useEffect(() => {
    const getEmbedUrl = (url: string) => {
      // Extract YouTube video ID from various URL formats
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = url.match(youtubeRegex)
      
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`
      }
      
      // If it's already an embed URL or other format, return as is
      return url
    }

    setEmbedUrl(getEmbedUrl(videoUrl))
  }, [videoUrl])

  const handleFullscreen = () => {
    const iframe = document.querySelector('iframe')
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      }
    }
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleFullscreen}
          className="bg-black/50 hover:bg-black/70"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
