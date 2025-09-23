import { FC } from "react";
import ArenaTile from "./ArenaTile";

const PredictionsTab: FC = () => {
  const predictions = [
    {
      title: "BTC above 100k?",
      description: "Odds: 60%",
      image: "/images/image1.png",
    },
    {
      title: "Team A vs Team B",
      description: "Prize pool: $10k",
      image: "/images/game1.png",
    },
    {
      title: "Election Outcome",
      description: "Odds: 45%",
      image: "/images/game2.png",
    },
  ];

  return (
    <div className="p-4">
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {predictions.map((prediction, index) => (
          <ArenaTile
            key={index}
            image={prediction.image}
            title={prediction.title}
            description={prediction.description}
          />
        ))}
      </div>
    </div>
  );
};

export default PredictionsTab;
