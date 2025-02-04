import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import LanguageDropdown from "./LanguageDropdown";

export default function FocusModal({
  isOpen,
  onClose,
  gameId,
  setFocusTeam,
  setFocusPlayer,
  setFocusArea,
  onGenerate, // New prop for triggering the video fetch in the parent
  setLanguage
}) {
  if (!isOpen) return null;

  const [teamsOptionsIds, setTeamsOptionsIds] = useState({});
  const [homeTeamInfo, setHomeTeamInfo] = useState({});
  const [awayTeamInfo, setAwayTeamInfo] = useState({});
  const [eventOptions, setEventOptions] = useState([]);
  const [userDefinedEvents, setUserDefinedEvents] = useState("");

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    if (!gameId) return;
    const fetchTeams = async () => {
      try {
        const response = await fetch(`http://shortpitchserver.com/getGameTeams?game_id=${gameId}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setTeamsOptionsIds(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, [gameId]);

  useEffect(() => {
    const fetchEventOptions = async () => {
      try {
        const response = await fetch(`http://shortpitchserver.com/getFocusAreas`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setEventOptions(data.focus_areas);
      } catch (error) {
        console.error("Error fetching focus areas:", error);
      }
    };
    fetchEventOptions();
  }, []);

  useEffect(() => {
    const homeTeamId = teamsOptionsIds.home_team_id;
    const awayTeamId = teamsOptionsIds.away_team_id;
    if (!homeTeamId || !awayTeamId) return;
    const fetchTeamInfos = async () => {
      try {
        const homeResponse = await fetch(
          `http://shortpitchserver.com/getGameTeamDetails?game_id=${gameId}&team_id=${homeTeamId}`
        );
        if (!homeResponse.ok) throw new Error(`HTTP error! Status: ${homeResponse.status}`);
        const homeData = await homeResponse.json();
        setHomeTeamInfo(homeData);

        const awayResponse = await fetch(
          `http://shortpitchserver.com/getGameTeamDetails?game_id=${gameId}&team_id=${awayTeamId}`
        );
        if (!awayResponse.ok) throw new Error(`HTTP error! Status: ${awayResponse.status}`);
        const awayData = await awayResponse.json();
        setAwayTeamInfo(awayData);
      } catch (error) {
        console.error("Error fetching team details:", error);
      }
    };
    fetchTeamInfos();
  }, [teamsOptionsIds, gameId]);

  // Toggle selection functions
  const toggleTeamSelection = (team) => {
    setSelectedTeams((prev) =>
      prev.some((t) => t.id === team.id)
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team]
    );
  };

  const togglePlayerSelection = (player) => {
    setSelectedPlayers((prev) =>
      prev.some((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player]
    );
  };

  const toggleEventSelection = (eventName) => {
    setSelectedEvents((prev) =>
      prev.includes(eventName)
        ? prev.filter((e) => e !== eventName)
        : [...prev, eventName]
    );
  };

  const handleGenerate = () => {
    const selectedTeamIds = selectedTeams.map((team) => team.id);
    const selectedPlayerIds = selectedPlayers.map((player) => player.id);
    const selectedEventsArray = selectedEvents.concat("User Defined : " + userDefinedEvents);
    
    setFocusTeam(selectedTeamIds);
    setFocusPlayer(selectedPlayerIds);
    setFocusArea(selectedEventsArray);
    
    // Call the parent's onGenerate callback to fetch the video.
    if (typeof onGenerate === "function") {
      onGenerate();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background Overlay */}
      {/* <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // close if overlay is clicked
      /> */}

      {/* Modal Container */}
      <motion.div
        className="relative bg-white rounded-2xl shadow-lg w-full max-w-3xl mx-auto p-6 z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>

        <h1 className="text-2xl font-bold mb-4 text-center">Personalize your highlight</h1>

        {/* Main Content */}
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Game Info */}
          <div className="flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-200 p-4 rounded-3xl shadow">
            {homeTeamInfo.logo && awayTeamInfo.logo ? (
              <>
                <div className="flex flex-col items-center mx-4">
                  <img
                    src={homeTeamInfo.logo}
                    alt={homeTeamInfo.name}
                    className="w-16 h-16 rounded-xl"
                  />
                  <span className="mt-2 font-semibold">{homeTeamInfo.name}</span>
                </div>
                <div className="text-2xl font-bold">VS</div>
                <div className="flex flex-col items-center mx-4">
                  <img
                    src={awayTeamInfo.logo}
                    alt={awayTeamInfo.name}
                    className="w-16 h-16 rounded-xl"
                  />
                  <span className="mt-2 font-semibold">{awayTeamInfo.name}</span>
                </div>
              </>
            ) : (
              <span className="text-gray-500">Game info not available</span>
            )}
          </div>

          {/* Row 2: Teams & Players */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TEAMS */}
            <div className="md:col-span-1 bg-gray-100 p-4 rounded-lg shadow flex flex-col">
              <h2 className="text-lg font-bold mb-2">Choose Teams to Focus On</h2>
              <div className="flex flex-col gap-3">
                {[homeTeamInfo, awayTeamInfo].map((team) =>
                  team.id ? (
                    <button
                      key={team.id}
                      onClick={() => toggleTeamSelection(team)}
                      className={`flex items-center gap-3 p-3 border rounded-3xl transition transform hover:scale-105 ${
                        selectedTeams.some((t) => t.id === team.id)
                          ? "bg-gradient-to-bl from-blue-500 to-blue-700 text-white"
                          : "bg-gradient-to-br from-gray-200 to-gray-300"
                      }`}
                    >
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-12 h-12 rounded-sm"
                      />
                      <span className="font-semibold">{team.name}</span>
                    </button>
                  ) : null
                )}
              </div>
            </div>

            {/* PLAYERS */}
            <div className="md:col-span-2 bg-gray-100 p-4 rounded-lg shadow flex flex-col">
              <h2 className="text-lg font-bold mb-2">Choose Players to Focus On</h2>
              {/* Home Team Players */}
              <div className="overflow-x-auto flex gap-3 p-2 border-b hide-scrollbar">
                {(homeTeamInfo.roster || []).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => togglePlayerSelection(player)}
                    className={`flex flex-col items-center justify-center p-3 border rounded-3xl min-w-[130px] transition transform hover:scale-105 ${
                      selectedPlayers.some((p) => p.id === player.id)
                        ? "bg-gradient-to-bl from-blue-500 to-blue-700 text-white"
                        : "bg-white"
                    }`}
                  >
                    <div className="w-full flex justify-center">
                      <img
                        src={player.snapshot}
                        alt={player.name}
                        className="w-1/3 h-auto rounded-full"
                      />
                    </div>
                    <span className="text-sm font-semibold mt-2">{player.name}</span>
                  </button>
                ))}
              </div>
              {/* Away Team Players */}
              <div className="overflow-x-auto flex gap-3 p-2 hide-scrollbar">
                {(awayTeamInfo.roster || []).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => togglePlayerSelection(player)}
                    className={`flex flex-col items-center justify-center p-3 border rounded-3xl min-w-[130px] transition transform hover:scale-105 ${
                      selectedPlayers.some((p) => p.id === player.id)
                        ? "bg-gradient-to-bl from-blue-500 to-blue-700 text-white"
                        : "bg-white"
                    }`}
                  >
                    <div className="w-full flex justify-center">
                      <img
                        src={player.snapshot}
                        alt={player.name}
                        className="w-1/3 h-auto rounded-full"
                      />
                    </div>
                    <span className="text-sm font-semibold mt-2">{player.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Events & Generate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* EVENTS */}
            <div className="md:col-span-2 bg-gray-200 p-4 rounded-lg shadow flex flex-col">
              <h2 className="text-lg font-bold mb-2">Choose Events to Focus On</h2>
              <div className="flex gap-3 flex-wrap">
                {eventOptions.map((eventName, index) => (
                  <button
                    key={index}
                    onClick={() => toggleEventSelection(eventName)}
                    className={`p-3 border rounded-2xl transition transform hover:scale-105 ${
                      selectedEvents.includes(eventName)
                        ? "bg-gradient-to-bl from-blue-500 to-blue-700 text-white"
                        : "bg-white"
                    }`}
                  >
                    {eventName}
                  </button>
                ))}
              </div>
              {/* User Defined Events Field */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  User Defined Events
                </label>
                <input
                  type="text"
                  value={userDefinedEvents}
                  onChange={(e) => setUserDefinedEvents(e.target.value)}
                  placeholder="Type your event requests..."
                  className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 text-base"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="md:col-span-1 bg-gray-200 p-4 rounded-lg shadow flex flex-col justify-center items-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <h1>Choose a language:</h1>
                <LanguageDropdown setParentLanguage={setLanguage} />
              </div>
              <button
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-lg transition"
                onClick={handleGenerate}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Global CSS to Hide Scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
