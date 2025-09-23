"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Channel {
  id: string
  name: string
  thumbnail?: string
  subscriberCount?: string
}

interface CategoryCarouselProps {
  channels?: Channel[]
  selectedChannelId?: string
  onChannelSelect?: (channel: Channel) => void
  headingClassName?: string
}

export function CategoryCarousel({ 
  channels = [], 
  selectedChannelId, 
  onChannelSelect,
  headingClassName 
}: CategoryCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Default channels if none provided
  const defaultChannels: Channel[] = [
    { 
      id: "1", 
      name: "HealthX",
      thumbnail: "/images/health-technology-background.png"
    },
    { 
      id: "2", 
      name: "IntelliVerse PlayX", 
      subscriberCount: "2.1M Subscribers",
      thumbnail: "/images/gaming-futuristic-blue.png"
    },
    { 
      id: "3", 
      name: "IntelliVerse TechX",
      thumbnail: "/images/robotics-ai-technology.png"
    },
    { 
      id: "4", 
      name: "GamingX",
      thumbnail: "/images/futuristic-sports-neon.png"
    },
    { 
      id: "5", 
      name: "FinanceX",
      thumbnail: "/images/fintech-charts-dark.png"
    }
  ]

  const displayChannels = channels.length > 0 ? channels : defaultChannels

  // Auto-scroll functionality
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const startAutoScroll = () => {
      scrollIntervalRef.current = setInterval(() => {
        if (scrollContainer) {
          const isAtEnd = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth
          
          if (isAtEnd) {
            // Reset to beginning for infinite loop
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' })
          } else {
            // Scroll to next position
            scrollContainer.scrollBy({ left: 300, behavior: 'smooth' })
          }
        }
      }, 3000) // Scroll every 3 seconds
    }

    const stopAutoScroll = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
    }

    // Start auto-scroll
    startAutoScroll()

    // Pause auto-scroll on hover
    const handleMouseEnter = () => stopAutoScroll()
    const handleMouseLeave = () => startAutoScroll()

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      stopAutoScroll()
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div 
      ref={scrollContainerRef}
      className="flex gap-6 overflow-x-auto pb-2 pt-4 scrollbar-none"
    >
      {displayChannels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onChannelSelect?.(channel)}
          className={cn(
            "group relative min-w-[280px] h-40 rounded-xl border-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02A7FD]/30 overflow-hidden flex-shrink-0",
            selectedChannelId === channel.id
              ? "border-[#02A7FD] ring-2 ring-[#02A7FD]/30"
              : "border-transparent hover:border-[#02A7FD]/40"
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={channel.thumbnail || "/images/placeholder-kn6di.png"}
              alt={channel.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 mt-6 flex flex-col justify-end h-full p-5 text-left">
            <h3 className={cn(
              "font-semibold text-xl mb-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold",
              headingClassName
            )}>
              {channel.name}
            </h3>
            {channel.subscriberCount && (
              <p className="text-sm text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                {channel.subscriberCount}
              </p>
            )}
          </div>

          {/* Hover Effect Ring */}
          <div className={cn(
            "absolute inset-0 rounded-xl transition-all duration-300",
            selectedChannelId === channel.id
              ? "ring-2 ring-[#02A7FD] ring-offset-2 ring-offset-[#0A0F2C]"
              : "group-hover:ring-2 group-hover:ring-[#02A7FD]/50 group-hover:ring-offset-2 group-hover:ring-offset-[#0A0F2C]"
          )} />
        </button>
      ))}
    </div>
  )
}
