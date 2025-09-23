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

interface ShortsRowProps {
  videos?: Video[]
  onVideoClick?: (video: Video) => void
}

export function ShortsRow({ videos = [], onVideoClick }: ShortsRowProps) {
  // Default shorts if none provided
  const defaultShorts: Video[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `short-${i}`,
    title: "Winner",
    desc: "Winner Cup Final Game | Clean Cuts | Open Field Run | Best Moments Highlight",
    img: `/placeholder.svg?height=160&width=280&query=sports%20action%20${i + 1}`,
  }))

  const displayShorts = videos.length > 0 ? videos : defaultShorts

  return (
    <div className="mt-4">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 scrollbar-none">
        {displayShorts.map((short) => (
          <article key={short.id} className="w-64 min-w-[256px] snap-start">
            <div 
              className="group relative aspect-[4/5] overflow-hidden rounded-[20px] ring-1 ring-white/10 cursor-pointer"
              onClick={() => onVideoClick?.(short)}
            >
              <Image
                src={short.img || "/placeholder.svg"}
                alt={`${short.title} thumbnail`}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="256px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center  ">
                <PlayIcon size={44} />
              </div>
              {short.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-0.5 rounded text-white">
                  {short.duration}
                </span>
              )}
            </div>
            <h4 className="mt-2 line-clamp-1 text-sm font-medium">{short.title}</h4>
            <p className="line-clamp-1 text-xs text-white/70">{short.desc}</p>
            {short.views && short.publishedAt && (
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <span>👁 {short.views}</span>
                <span>• {short.publishedAt}</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
