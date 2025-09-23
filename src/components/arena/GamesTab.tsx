import { FC } from "react";
import ArenaTile from "./ArenaTile";

const GamesTab: FC = () => {
  const games = [
    {
      title: "Esports World Cup 2025",
      description: "Peek-A-Boo Game",
      image: "/images/image1.png",
    },
    {
      title: "MLBB Mid-Season Cup 2025",
      description: "Monster Party",
      image: "/images/game1.png",
    },
    {
      title: "PUBG Mobile World Cup 2025",
      description: "Slot Machine",
      image: "/images/game2.png",
    },
    {
      title: "Valorant Masters Toronto 2025",
      description: "Street Hoops",
      image: "/images/game3.png",
    },
    {
      title: "Valorant Masters Toronto 2025",
      description: "Stopots",
      image: "/images/game4.png",
    },
  ];

  return (
    <div className="p-4">
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {games.map((game, index) => (
          <ArenaTile
            key={index}
            image={game.image}
            title={game.title}
            description={game.description}
          />
        ))}
      </div>
    </div>
  );
};

export default GamesTab;
