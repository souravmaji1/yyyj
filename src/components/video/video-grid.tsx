"use client"

import Image from "next/image"
import { PlayIcon } from "./play-icon"

interface Video {
  id: string
  title: string
  desc: string
  img: string
  duration?: string
  views?: string
  publishedAt?: string
}

interface VideoGridProps {
  videos?: Video[]
  onVideoClick?: (video: Video) => void
}

export function VideoGrid({ videos = [], onVideoClick }: VideoGridProps) {
  // Default videos if none provided
  const defaultVideos: Video[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `video-${i}`,
    title: "Winner",
    desc: "Winner Cup Final Game | Clean Cuts | Open Field Run | Best Moments Highlight",
    img: `/placeholder.svg?height=180&width=320&query=sports%20play%20${i + 1}`,
  }))

  const displayVideos = videos.length > 0 ? videos : defaultVideos

  return (
    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {displayVideos.map((video) => (
        <article key={video.id} className="group">
          <div 
            className="relative aspect-video overflow-hidden rounded-[20px] ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.01] cursor-pointer"
            onClick={() => onVideoClick?.(video)}
          >
            <Image
              src={video.img || "/placeholder.svg"}
              alt={`${video.title} thumbnail`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-95">
              <PlayIcon size={48} />
            </div>
            {video.duration && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-0.5 rounded text-white">
                {video.duration}
              </span>
            )}
          </div>
          <h4 className="mt-2 line-clamp-1 text-sm font-medium">{video.title}</h4>
          <p className="line-clamp-1 text-xs text-white/70">{video.desc}</p>
          {video.views && video.publishedAt && (
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span>👁 {video.views}</span>
              <span>• {video.publishedAt}</span>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

