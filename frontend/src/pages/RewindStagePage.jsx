import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Player } from "@remotion/player";
import { DynamicVideo } from "../remotions/DynamicVideo.jsx";
import CommentBox from "../components/CommentBox.jsx";
import ChatBox from "../components/ChatBox.jsx";
import Lottie from "lottie-react";
import rewindLoad from "../assets/rewindLoad.json";
import FocusModal from "../components/FocusModal.jsx";
import { v4 as uuidv4 } from 'uuid';

const RewindStagePage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(true);

  const [focusPlayers, setFocusPlayers] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [focusTeams, setFocusTeams] = useState([]);
  const [language, setLanguage] = useState(null);

  const playerRef = useRef(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 

  const handleGenerateFocus = async () => {
    let musicURL = null;
    try {
      const response = await fetch("http://shortpitchserver.com/getRandomMusic");
      const data = await response.json();
      musicURL = data["url"];
    } catch (error) {
      console.error("Error fetching music:", error);
    }

    const params = new URLSearchParams({
      game_id: gameId,
      focus_players: JSON.stringify(focusPlayers),
      focus_areas: JSON.stringify(focusAreas),
      focus_teams: JSON.stringify(focusTeams),
      music_url: musicURL,
      language: language,
    });
    setLoading(true);
    fetch(`http://shortpitchserver.com/game-rewind?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setVideoData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching video data:", error);
        setLoading(false);
      });
  };

  const compWidth = Math.floor((windowSize.width * 2) / 3);
  const compHeight = Math.floor((windowSize.height * 6) / 7);

  return (
    <div className="w-screen h-screen bg-gray-100 p-6 grid grid-rows-[1fr_6fr] gap-4">
      {/* HEADER / TITLE AREA */}
      <div
        className="
          grid 
          grid-cols-3 
          w-full 
          h-full 
          items-center 
          justify-center 
          rounded-3xl 
          bg-gray-100 
          shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]
        "
      >
        <button
          onClick={() => navigate("/games-menu")}
          className="
            col-start-1 
            flex 
            items-center 
            justify-center 
            bg-gray-100 
            rounded-full 
            p-2 
            shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]
            focus:outline-none
          "
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => navigate("/")}
          className="col-start-2 flex items-center justify-center text-gray-700 font-bold text-5xl focus:outline-none"
        >
          MyRewind
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* VIDEO PLAYER AREA */}
        <div
          className="
            col-span-2 
            flex 
            items-center 
            justify-center 
            rounded-3xl 
            p-4 
            bg-black
          "
          style={{ height: `${compHeight}px` }}
        >
          {loading ? (
            <Lottie animationData={rewindLoad} loop className="w-48 h-48" />
          ) : videoData ? (
            <Player
              ref={playerRef}
              component={DynamicVideo}
              durationInFrames={Math.round(videoData.total_duration * 30)}
              fps={30}
              compositionWidth={compWidth}
              compositionHeight={compHeight}
              inputProps={{ data: videoData }}
              className="rounded-3xl shadow-md w-full h-full"
              style={{
                width: `${compWidth}px`,
                height: `${compHeight}px`,
                borderRadius: "1.5rem",
              }}
              controls
              loop={false}
              autoPlay={false}
              clickToPlay={false}
              doubleClickToFullscreen={false}
              spaceKeyToPlayOrPause={false}
            />
          ) : (
            <p className="text-white">No video generated yet.</p>
          )}
        </div>

        {/* SIDE PANEL (Comments + Chat) */}
        <div
          className="
            col-span-1 
            grid 
            grid-rows-2 
            rounded-3xl 
            gap-3 
            bg-gray-100 
            text-gray-700
            shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]
            p-4
          "
        >
          <CommentBox gameId={gameId} />
          <ChatBox sessionId={uuidv4()} gameId={gameId} />
        </div>
      </div>

      {/* Focus Modal */}
      <FocusModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        setFocusArea={setFocusAreas}
        setFocusPlayer={setFocusPlayers}
        setFocusTeam={setFocusTeams}
        gameId={gameId}
        onGenerate={handleGenerateFocus}
        setLanguage={setLanguage}
      />
    </div>
  );
};

export default RewindStagePage;
