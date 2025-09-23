import { useRef, useState, useEffect } from 'react';
import { ArenaEvent } from '@/src/types/arena';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NetflixCard from '@/src/components/arena/NetflixCard';

interface NetflixCarouselProps {
  title: string;
  events: ArenaEvent[];
  onOpen: (id: string) => void;
  className?: string;
}

export default function NetflixCarousel({ title, events, onOpen, className = '' }: NetflixCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const scrollAmount = 300;
    const currentScroll = carouselRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    carouselRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  const checkScrollPosition = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      
      return () => {
        carousel.removeEventListener('scroll', checkScrollPosition);
      };
    }
    return () => {};
  }, [events]);

  if (events.length === 0) return null;

  return (
      <div className={`relative ${className} mb-12`}>
      {/* Header with Title and Scroll Indicator */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-8">
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>
        
        {/* Scroll Indicator */}
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
      
      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        
        {/* Scrollable Content */}
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-8 scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((event) => (
            <div key={event.id} className="flex-none w-48 md:w-56">
              <NetflixCard event={event} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
