"use client";

import React from "react";
import { FC } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
interface GameCardProps {
  image: string;
  title: string;
  name: string;
}

const GameCard: FC<GameCardProps> = ({ image, title, name }) => {
  return (
    <div className="border border-[#1D1F34] rounded-xl p-5 flex flex-col items-center">
      <img
        src={image}
        alt={title}
        className="rounded-lg w-full h-[170px] 2xl:h-[200px] object-cover mb-4"
      />
      <h3 className="text-white text-center text-sm font-medium mb-2">
        {name}
      </h3>
      <button className="bg-[var(--color-primary-700)] text-white btn-action-consistent w-full">
        Play to Earn
      </button>
    </div>
  );
};

const TournamentsSection = () => {
  const games = [
    {
      name: "Esports World Cup 2025",
      title: "Peek-A-Boo Game",
      image: "/images/image1.png",
    },
    {
      name: "MLBB Mid-Season Cup 2025",
      title: "Monster Party",
      image: "/images/MLBB.png",
    },
    {
      name: "PUBG Mobile World Cup 2025",
      title: "Slot Machine",
      image: "/images/pubg.png",
    },
    {
      name: "Valorant Masters Toronto 2025",
      title: "Street Hoops",
      image: "/images/Toronto.png",
    },
    {
      name: "Valorant Masters Toronto 2025",
      title: "Stopots",
      image: "/images/game4.png",
    },
  ];

  return (
    <section className="py-16 bg-gaming-dark">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-white">Tournaments</h2>
          <Button className="bg-transparent h-12 border border-white rounded-md px-8 text-base font-semibold flex items-center justify-center gap-2">
            View More
          </Button>
        </div>

        <div className="mb-8 sm:mb-10">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {games.map((game, index) => (
              <GameCard
                key={index}
                image={game.image}
                title={game.title}
                name={game.name}
              />
            ))}
          </div>
        </div>

        <div className="px-6 md:px-12 py-16 md:py-20 bg-[url(/images/nft.png)] bg-no-repeat bg-center bg-cover rounded-[30px] grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Play &<br />
              Earn Crypto
            </h2>
            <p className="text-sm md:text-base text-white font-medium max-w-md mb-6">
              Turn your gaming time into real crypto rewards.
              <br />
              No mining – just pure fun and earning!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/arena" prefetch={true}>
                <Button
                  className="bg-[var(--color-primary-700)] btn-action-consistent text-white"
                >
                  Play To Earn
                </Button>
              </Link>
              <Link href="/shop" prefetch={true}>
                <Button className="bg-[#011A62] btn-action-consistent text-white">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:block" />
        </div>
      </div>
    </section>
  );
};

export default TournamentsSection;
