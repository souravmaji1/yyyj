import { FC } from "react";
import ArenaTile from "./ArenaTile";

const TournamentsTab: FC = () => {
  const tournaments = [
    {
      title: "Esports World Cup 2025",
      description: "Global championship event",
      image: "/images/image1.png",
    },
    {
      title: "MLBB Mid-Season Cup 2025",
      description: "Regional qualifiers",
      image: "/images/MLBB.png",
    },
    {
      title: "PUBG Mobile World Cup 2025",
      description: "Battle royale showdown",
      image: "/images/pubg.png",
    },
    {
      title: "Valorant Masters Toronto 2025",
      description: "International stage",
      image: "/images/Toronto.png",
    },
  ];

  return (
    <div className="p-4">
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {tournaments.map((tournament, index) => (
          <ArenaTile
            key={index}
            image={tournament.image}
            title={tournament.title}
            description={tournament.description}
          />
        ))}
      </div>
    </div>
  );
};

export default TournamentsTab;
