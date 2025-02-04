import React, { useState } from "react";
import GameItem from "./GameItem";
import { useEffect } from "react";
const AdvancedSearch = () => {
   
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTeam1, setSelectedTeam1] = useState("");
  const [selectedTeam2, setSelectedTeam2] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch("http://shortpitchserver.com/getAllTeamNames");
                const data = await response.json();
                console.log("Fetched Teams:", data);  // Debugging
                setTeams(data || []);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };
        fetchTeams();
    }, []);
            
    
  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://shortpitchserver.com/findGames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate || null,
          end_date: endDate || null,
          team1: selectedTeam1 || null,
          team2: selectedTeam2 || null,
        }),
      });

      const data = await response.json();
      setSearchResults(data.games || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* 🔥 Fixed Search Bar at the Top */}
      <div className="p-6 border-b sticky top-0 bg-white z-10">
        <h2 className="text-xl font-semibold mb-4">Advanced Search</h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700">Team 1</label>
            <select
              value={selectedTeam1}
              onChange={(e) => setSelectedTeam1(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a team</option>
              {teams.map((team, index) => (
                <option key={index} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700">Team 2 (optional)</label>
            <select
              value={selectedTeam2}
              onChange={(e) => setSelectedTeam2(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a team</option>
              {teams.map((team, index) => (
                
                <option key={index} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex justify-center">
            <button
              type="button"
              onClick={fetchGames}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Search Games
            </button>
          </div>
        </form>
      </div>

      {/* 🔥 Scrollable Results Section */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && <p className="text-gray-500 text-center">Loading...</p>}

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((game) => (
                console.log("Search Results:", searchResults),  // Debugging    
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
        ) : (
          !loading && <p className="text-gray-500 text-center">No games found.</p>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
