import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBaseballBall, FaUsers, FaCalendarAlt, FaSearch } from "react-icons/fa";
import GameItem from "../components/GameItem";
import AdvancedSearch from "../components/AdvancedSearch";

// Helper to generate a team logo URL from the team id.
const getTeamLogo = (teamId) =>
  `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`;

/* 📌 Main Component */
const GamesMenuPage = () => {
  const [selected, setSelected] = useState("Recent Games");
  const [teamsInformation, setTeamsInformation] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all team data for the Teams tab.
  // Expected API response format: [ [id, name], [id, name], ... ]
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const response = await fetch("http://shortpitchserver.com/getAllTeamNamesAndIds");
        const data = await response.json();
        // Data is an array of arrays, e.g., [ [133, "Athletics"], [134, "Pittsburgh Pirates"], ... ]
        setTeamsInformation(data);
        
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      } finally {
        // Simulate a delay for smoother UI transitions.
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchTeamsData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 fixed h-full">
        <h1 className="text-2xl font-bold text-center mb-6">MLB Wrapped</h1>
        <nav className="space-y-4">
          {menuItems.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={`flex items-center w-full p-3 rounded-lg transition ${
                selected === name ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
            >
              <span className="mr-3 text-lg">{icon}</span> {name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 ml-64 overflow-auto">
        {loading ? (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {selected === "Recent Games" && <RecentGames />}
              {selected === "Teams" && <Teams teamsInformation={teamsInformation} />}
              {selected === "Year" && <YearFilter />}
              {selected === "Search" && <AdvancedSearch />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

/* 📌 Recent Games Component */
const RecentGames = () => {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        const response = await fetch("http://shortpitchserver.com/getMostRecentGames?count=20");
        const data = await response.json();
        if (data.status === "success") {
          setGames(data.games);
        } else {
          console.error("Error fetching games:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch recent games:", error);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchRecentGames();
  }, []);

  if (loadingGames) {
    return (
      <motion.div
        className="flex items-center justify-center h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {games.map((game) => (
        <GameItem
          key={game.game_id}
          gameId={game.game_id}
          homeTeamName={game.home_team}
          homeTeamLogo={game.home_team_logo}
          awayTeamName={game.away_team}
          awayTeamLogo={game.away_team_logo}
          dateTime={game.date}
        />
      ))}
    </motion.div>
  );
};

/* 📌 Teams Component */
const Teams = ({ teamsInformation }) => (
  <motion.div
    className="space-y-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {teamsInformation.length > 0 &&
      teamsInformation.map((team) => (
        // team is an array: [id, name]
        <TeamSection key={team[0]} team={team} />
      ))}
  </motion.div>
);

/* Single Team Section */
const TeamSection = ({ team }) => {
  // Extract id and name from the array.
  const teamId = team[0];
  const teamName = team[1];
  return (
    <motion.div className="space-y-4">
      <div className="flex items-center space-x-3">
        <img src={getTeamLogo(teamId)} alt={teamName} className="w-10 h-10" />
        <h2 className="text-2xl font-semibold">{teamName}</h2>
      </div>
      {teamId ? (
        <TeamGames teamId={teamId} />
      ) : (
        <div className="text-red-500">Team ID not available</div>
      )}
    </motion.div>
  );
};

/* Fetch recent games for a single team */
const TeamGames = ({ teamId }) => {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    if (!teamId) {
      console.error("Team ID is undefined, cannot fetch team games");
      setLoadingGames(false);
      return;
    }
    const fetchTeamGames = async () => {
      try {
        const url = `http://shortpitchserver.com/getMostRecentGames?teamId=${teamId}&count=10`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "success") {
          setGames(data.games);
        } else {
          console.error("Error fetching team games:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch team games:", error);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchTeamGames();
  }, [teamId]);

  if (loadingGames) {
    return (
      <motion.div
        className="flex items-center justify-center h-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="overflow-x-auto flex space-x-4 p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {games.map((game) => (
        <GameItem
          key={game.game_id}
          gameId={game.game_id}
          homeTeamName={game.home_team}
          homeTeamLogo={game.home_team_logo}
          awayTeamName={game.away_team}
          awayTeamLogo={game.away_team_logo}
          dateTime={game.date}
        />
      ))}
    </motion.div>
  );
};

/* 📌 Year Filter Component */
const YearFilter = () => {
  const years = [2024, 2023, 2022, 2021, 2020];
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {years.map((year) => (
        <YearSection key={year} year={year} />
      ))}
    </motion.div>
  );
};

/* Fetch games for a given year via the POST /findGames endpoint */
const YearSection = ({ year }) => {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    const fetchYearGames = async () => {
      try {
        const payload = {
          start_date: `${year}-01-01`,
          end_date: `${year}-12-31`,
        };
        const response = await fetch("http://shortpitchserver.com/findGames", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.status === "success") {
          setGames(data.games);
        } else {
          console.error("Error fetching games for year:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch games for year:", error);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchYearGames();
  }, [year]);

  return (
    <motion.div className="space-y-4">
      <h2 className="text-2xl font-semibold">{year}</h2>
      {loadingGames ? (
        <motion.div
          className="flex items-center justify-center h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      ) : (
        <div className="overflow-x-auto flex space-x-4 p-2">
          {games.map((game) => (
            <GameItem
              key={game.game_id}
              gameId={game.game_id}
              homeTeamName={game.home_team}
              homeTeamLogo={game.home_team_logo}
              awayTeamName={game.away_team}
              awayTeamLogo={game.away_team_logo}
              dateTime={game.date}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* 📌 Menu Items */
const menuItems = [
  { name: "Recent Games", icon: <FaBaseballBall /> },
  { name: "Teams", icon: <FaUsers /> },
  { name: "Year", icon: <FaCalendarAlt /> },
  { name: "Search", icon: <FaSearch /> },
];

export default GamesMenuPage;
