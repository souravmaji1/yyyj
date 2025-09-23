import { FC } from "react";

interface ArenaTileProps {
  image: string;
  title: string;
  description: string;
}

const ArenaTile: FC<ArenaTileProps> = ({ image, title, description }) => {
  return (
    <div className="flex-none w-48 sm:w-60 md:w-64 lg:w-72">
      <img
        src={image}
        alt={title}
        className="w-full h-32 sm:h-36 md:h-40 lg:h-44 object-cover rounded-md"
      />
      <h3 className="mt-2 text-sm sm:text-base font-semibold line-clamp-1">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-300 line-clamp-2">
        {description}
      </p>
    </div>
  );
};

export default ArenaTile;
