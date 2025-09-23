import React, { useEffect, useState } from "react";

import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { testimonials } from "@/src/constants";

const CommunityCrousel = () => {
    const [api, setApi] = useState<any>(null);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) return;
        api.on("select", () => {
          setCurrent(api.selectedScrollSnap());
        });
      }, [api]);

    const autoplayOptions = {
        delay: 3000,  // Slides every 3 seconds
        rootNode: (emblaRoot: any) => emblaRoot.parentElement,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
    };
    const autoplay = Autoplay(autoplayOptions);


    return (
        <Carousel
            plugins={[autoplay]}
            setApi={setApi}
            className="w-full"
            opts={{
                align: "center",
                loop: true,
                skipSnaps: false,
                active: true,
            }}
        >
            <CarouselContent>
                {testimonials.map((testimonial, index) => (
                    <CarouselItem
                        key={index}
                        className="basis-full sm:basis-1/3 lg:basis-1/4 px-2 sm:px-2"
                    >
                        <div
                            className={`border-2 border-[#1D1F34] backdrop-blur-sm rounded-xl p-4 transform transition-all duration-300 hover:scale-105 ${current === index ? "bg-[#020C49]" : "bg-transparent"
                                }`}
                        >
                            <div className="flex flex-col items-start text-left">
                                <p className="text-xs sm:text-sm font-medium text-white mb-4 sm:mb-4 line-clamp-4">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-between w-full">
                                    <div className="flex flex-col sm:flex-row items-center gap-2.5 ">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-lg sm:text-xl font-bold text-white">
                                            {testimonial.author[0]}
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h4 className="font-bold text-[var(--color-primary-700)] text-xs sm:text-sm">
                                                {testimonial.author}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-white">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 text-[var(--color-primary)]">
                                        {Array(testimonial.rating)
                                            .fill("★")
                                            .map((star, i) => (
                                                <span
                                                    key={i}
                                                    className="animate-pulse text-sm sm:text-base"
                                                >
                                                    {star}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}

export default CommunityCrousel;