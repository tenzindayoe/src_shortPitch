import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const truncateName = (name) => {
  if (!name) return "";
  return name.length > 10 ? name.slice(0, 10) + "…" : name;
};

const GameItem = ({
  gameId,
  homeTeamName,
  homeTeamLogo,
  awayTeamName,
  awayTeamLogo,
  dateTime,
}) => {
  const navigate = useNavigate();

  const handlePlayClick = (e) => {
    e.stopPropagation();
    navigate(`/rewind-stage/${gameId}`);
  };

  return (
    <motion.div
      onClick={() => navigate(`/rewind-stage/${gameId}`)}
      className="w-auto flex-shrink-0 p-4 sm:p-6 bg-gray-100 rounded-xl 
                 shadow-md hover:shadow-lg transition-all 
                 flex flex-col justify-between items-center relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Team Logos & Names */}
      <div className="flex justify-between items-center gap-8">
        {/* Home Team */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={homeTeamLogo || "https://via.placeholder.com/40"}
              alt={homeTeamName}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1 text-center">
            {truncateName(homeTeamName)}
          </p>
        </div>

        {/* "vs" Separator */}
        <span className="text-gray-500 font-semibold text-sm sm:text-lg">vs</span>

        {/* Away Team */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={awayTeamLogo || "https://via.placeholder.com/40"}
              alt={awayTeamName}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1 text-center">
            {truncateName(awayTeamName)}
          </p>
        </div>
      </div>

      {/* Date & Play Button */}
      <div className="flex justify-between items-center mt-4 w-full">
        <p className="text-xs sm:text-sm text-gray-600">{dateTime}</p>

        <button
          onClick={handlePlayClick}
          className="w-24 sm:w-28 h-8 sm:h-10 flex items-center justify-center 
                     bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-all 
                     text-blue-500 font-semibold text-xs sm:text-sm"
        >
          Play
        </button>
      </div>
    </motion.div>
  );
};

export default GameItem;
