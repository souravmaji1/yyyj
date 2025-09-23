import { FC } from "react";
import './responsive.mobile.css';

interface GameCardProps {
  image: string;
  title: string;
}

const GameCard: FC<GameCardProps> = ({ image, title }) => {
  return (
    <div className="border border-[#1D1F34] rounded-xl p-5 flex flex-col items-center">
      <img
        src={image}
        alt={title}
        className="rounded-lg w-full h-[220px] sm:h-[170px] 2xl:h-[200px] object-cover mb-4"
      />
      <button className="bg-[var(--color-primary-700)] text-white px-4 h-11 sm:h-[51px]  text-xs sm:text-base font-semibold rounded-md w-full">
        Play to Earn
      </button>
    </div>
  );
};

const GamesSection: FC = () => {
  const games = [
    {
      title: "Peek-A-Boo Game",
      image: "/images/game.png",
    },
    {
      title: "Monster Party",
      image: "/images/game1.png",
    },
    {
      title: "Slot Machine",
      image: "/images/game2.png",
    },
    {
      title: "Street Hoops",
      image: "/images/game3.png",
    },
    {
      title: "Stopots",
      image: "/images/game4.png",
    },
  ];

  return (
    <>
      <div className="container mx-auto px-4 relative z-10 mb-10 gamesgrid-mobile-fix">
        <div className=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {games.map((game, index) => (
            <GameCard key={index} image={game.image} title={game.title} />
          ))}
        </div>
      </div>
      <div className="">
        <img
          src="/images/allinone.png"
          className="rounded-lg w-full h-full object-cover mb-0"
        />

      </div>
    </>
  );
};

export default GamesSection;
