"use client";

import React from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './responsive.mobile.css';

const Games = () => {
    const sliderRef = React.useRef<Slider | null>(null);

    const settings = {
        dots: false,
        arrows: false, // we're using custom arrows
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    const games = [
        {
            title: "Fruit Ninja",
            description:
                "Race against the world in this blockchain enabled kart racing game. Battle it out as your favorite Crypto stars.",
            logo: "/images/ninjasmall.png",
            image: "/images/ninja.png",
        },
        {
            title: "Another Game",
            description: "Race against the world in this blockchain enabled kart racing game. Battle it out as your favorite Crypto stars.",
            logo: "/images/ninjasmall.png",
            image: "/images/ninja.png",
        },
    ];

    return (
        <section 
            className="relative w-full mx-auto mb-14 games-mobile-fix"
            aria-labelledby="games-heading"
        >
            <div className="container mx-auto px-4 relative z-10">
                <h2 id="games-heading" className="sr-only">Gaming Arena</h2>
                <Slider ref={sliderRef} {...settings}>
                    {games.map((game, index) => (
                        <div
                            key={index}
                            className="!flex w-full flex-col md:flex-row gap-8 rounded-xl items-center justify-start"
                        >
                            <Link
                                href="/arena"
                                aria-label="Enter Arena"
                                className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] rounded-xl"
                            >
                                <article className="!flex w-full flex-col md:flex-row gap-8 rounded-xl items-center justify-start group-hover:scale-[1.02] transition-all duration-300">
                                    {/* Left Panel */}
                                    <div
                                        style={{
                                            'background': 'linear-gradient(180deg, #011A62 68.64%, #0235C8 136.22%)'
                                        }}
                                        className="text-white p-6 rounded-xl md:max-w-[340px] flex flex-col justify-between h-[360px] relative group-hover:shadow-lg group-hover:shadow-[var(--color-primary)]/25"
                                    >
                                        <div>
                                            <img
                                                src={game.logo}
                                                alt={`${game.title} Logo`}
                                                className="w-[91px] h-24 mb-4 object-cover"
                                            />
                                            <h3 className="text-3xl font-bold mb-2">{game.title}</h3>
                                            <p className="text-base text-white">{game.description}</p>
                                        </div>

                                    </div>

                                    {/* Right Panel */}
                                    <div className="rounded-[29px] overflow-hidden w-full">
                                        <img
                                            src={game.image}
                                            alt={`${game.title} Preview`}
                                            className="w-full h-[360px] object-cover rounded-xl"
                                        />
                                    </div>
                                </article>
                            </Link>
                        </div>
                    ))}
                </Slider>

                {/* Custom Arrows at Extreme Left and Right Edges */}
                <button
                    onClick={() => sliderRef.current?.slickPrev()}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-[99999] bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-all duration-200"
                    aria-label="Previous slide"
                >
                    <span className="text-2xl font-bold">&lt;</span>
                </button>
                <button
                    onClick={() => sliderRef.current?.slickNext()}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-[99999] bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-all duration-200"
                    aria-label="Next slide"
                >
                    <span className="text-2xl font-bold">&gt;</span>
                </button>
            </div>
        </section>
    );
};

export default Games;
