import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionTemplate } from "framer-motion";

// -------------------------
// NEUMORPHIC STYLING
// -------------------------
const neumorphicCellStyle = {
  borderRadius: "10px",
  boxShadow: "4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(255,255,255,0.1)",
  background: "linear-gradient(145deg, #121212, #1a1a1a)",
  padding: "12px",
  minWidth: "50px",
  textAlign: "center",
  fontWeight: "bold",
  color: "#ddd",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
};

const neumorphicButtonStyle = {
  padding: "12px 24px",
  fontSize: "1rem",
  fontWeight: "bold",
  color: "#fff",
  background: "linear-gradient(145deg, #1a1a1a, #121212)",
  boxShadow: "4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(255,255,255,0.1)",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
};

// -------------------------
// MAIN SCOREBOARD COMPONENT
// -------------------------
export const LineBox = ({ data }) => {
  if (!data) {
    console.error("No data provided to LineBox component");
    return null;
  }

  const { score } = data;
  const { home_team, away_team, scoreboard } = score;
  const { innings, totals, current_inning } = scoreboard;

  // -------------------------
  // FETCH TEAM DETAILS
  // -------------------------
  const [homeTeamDetails, setHomeTeamDetails] = useState({ name: "", logo: "" });
  const [awayTeamDetails, setAwayTeamDetails] = useState({ name: "", logo: "" });

  useEffect(() => {
    if (home_team) {
      fetch(`http://localhost:8000/getTeamDetails?team_id=${home_team}`)
        .then((res) => res.json())
        .then((info) => {
          setHomeTeamDetails({ name: info.name, logo: info.logo });
        });
    }
    if (away_team) {
      fetch(`http://localhost:8000/getTeamDetails?team_id=${away_team}`)
        .then((res) => res.json())
        .then((info) => {
          setAwayTeamDetails({ name: info.name, logo: info.logo });
        });
    }
  }, [home_team, away_team]);

  // -------------------------
  // BACKGROUND GRADIENT
  // -------------------------
  const backgroundGradient = useMotionTemplate`linear-gradient(135deg, #0f0f0f, #181818)`;

  // -------------------------
  // VANTA WAVES INITIALIZATION
  // -------------------------
  const vantaRef = useRef(null);
  const vantaEffectRef = useRef(null);

  // Helper for dynamic script loading
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.body.appendChild(script);
    });

  useEffect(() => {
    let canceled = false; // to prevent running if unmounted

    async function initVantaWaves() {
      try {
        // 1. Load THREE if missing
        if (!window.THREE) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        }
        // 2. Load vanta.waves if missing
        if (!window.VANTA || !window.VANTA.WAVES) {
          await loadScript("https://cdn.jsdelivr.net/npm/vanta/dist/vanta.waves.min.js");
        }

        // 3. If still mounted and has a ref, init
        if (!canceled && vantaRef.current && window.VANTA?.WAVES) {
          vantaEffectRef.current = window.VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x0,
            waveHeight: 26.5,
            waveSpeed: 0.8,
            zoom: 0.76,
          });
        }
      } catch (err) {
        console.error("Error loading / initializing Vanta Waves:", err);
      }
    }

    initVantaWaves();

    // Cleanup
    return () => {
      canceled = true;
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };
  }, []); // empty dependency array -> run once

  // -------------------------
  // MODAL STATES & HANDLERS
  // -------------------------
  const [selectedInning, setSelectedInning] = useState(null);
  const handleInningClick = (inning) => setSelectedInning(inning);
  const closeInningModal = () => setSelectedInning(null);

  const [selectedTeamInning, setSelectedTeamInning] = useState(null);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  const handleTeamCellClick = (inning, team) => {
    setSelectedTeamInning({ inning, team });
    setShowDetailedInfo(false);
  };
  const closeTeamModal = () => {
    setSelectedTeamInning(null);
    setShowDetailedInfo(false);
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div ref={vantaRef} style={parentContainerStyle}>
      <motion.div
        style={{
          width: "90%",
          maxWidth: "1000px",
          padding: "40px",
          borderRadius: "20px",
          background: backgroundGradient,
          boxShadow: "0 0 20px rgba(0,0,0,0.8)",
          zIndex: 1, // ensure it's above vanta canvas
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#fff",
            fontSize: "2rem",
          }}
        >
          MLB Scoreboard
        </h2>

        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <motion.th
                whileHover={{ scale: 1.05 }}
                style={{ ...neumorphicCellStyle, background: "#222" }}
              >
                Team
              </motion.th>
              {innings.map((inning) => (
                <motion.th
                  key={inning.inning}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleInningClick(inning)}
                  style={
                    inning.inning === current_inning && current_inning !== -1
                      ? {
                          ...neumorphicCellStyle,
                          boxShadow: "0 0 8px 2px #FFDD00",
                          border: "1px solid #FFDD00",
                          background: "#222",
                          cursor: "pointer",
                        }
                      : { ...neumorphicCellStyle, background: "#222", cursor: "pointer" }
                  }
                >
                  {inning.inning}
                </motion.th>
              ))}
              <motion.th
                whileHover={{ scale: 1.05 }}
                style={{ ...neumorphicCellStyle, background: "#222" }}
              >
                R
              </motion.th>
              <motion.th
                whileHover={{ scale: 1.05 }}
                style={{ ...neumorphicCellStyle, background: "#222" }}
              >
                H
              </motion.th>
              <motion.th
                whileHover={{ scale: 1.05 }}
                style={{ ...neumorphicCellStyle, background: "#222" }}
              >
                E
              </motion.th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <motion.td
                whileHover={{ scale: 1.05 }}
                style={neumorphicCellStyle}
                onClick={() => handleTeamCellClick(innings[0], "away")}
              >
                <img
                  src={awayTeamDetails.logo}
                  alt={awayTeamDetails.name}
                  style={{ width: "30px", marginRight: "8px" }}
                />
                {awayTeamDetails.name || away_team}
              </motion.td>
              {innings.map((inning, index) => (
                <motion.td
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  style={
                    inning.inning === current_inning && current_inning !== -1
                      ? {
                          ...neumorphicCellStyle,
                          boxShadow: "0 0 8px 2px #FFDD00",
                          border: "1px solid #FFDD00",
                        }
                      : neumorphicCellStyle
                  }
                  onClick={() => handleTeamCellClick(inning, "away")}
                >
                  {inning.away.runs.runs}
                </motion.td>
              ))}
              <motion.td whileHover={{ scale: 1.05 }} style={neumorphicCellStyle}>
                {totals.away.runs}
              </motion.td>
              <motion.td whileHover={{ scale: 1.05 }} style={neumorphicCellStyle}>
                {totals.away.hits}
              </motion.td>
              <motion.td whileHover={{ scale: 1.05 }} style={neumorphicCellStyle}>
                {totals.away.errors}
              </motion.td>
            </tr>
            <tr>
              <motion.td
                whileHover={{ scale: 1.05 }}
                style={neumorphicCellStyle}
                onClick={() => handleTeamCellClick(innings[0], "home")}
              >
                <img
                  src={homeTeamDetails.logo}
                  alt={homeTeamDetails.name}
                  style={{ width: "30px", marginRight: "8px" }}
                />
                {homeTeamDetails.name || home_team}
              </motion.td>
              {innings.map((inning, index) => (
                <motion.td
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  style={
                    inning.inning === current_inning && current_inning !== -1
                      ? {
                          ...neumorphicCellStyle,
                          boxShadow: "0 0 8px 2px #FFDD00",
                          border: "1px solid #FFDD00",
                        }
                      : neumorphicCellStyle
                  }
                  onClick={() => handleTeamCellClick(inning, "home")}
                >
                  {inning.home.runs.runs}
                </motion.td>
              ))}
              <motion.td whileHover={{ scale: 1.05 }} style={neumorphicCellStyle}>
                {totals.home.runs}
              </motion.td>
              <motion.td whileHover={{ scale: 1.05 }} style={neumorphicCellStyle}>
                {totals.home.hits}
              </motion.td>
              <motion.td whileHover={{ scale: 1.05 }} style={neumorphicCellStyle}>
                {totals.home.errors}
              </motion.td>
            </tr>
          </tbody>
        </table>
      </motion.div>

      {/* ----------------------
          Modal: Both Teams
      ---------------------- */}
      <AnimatePresence>
        {selectedInning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={modalBackdropStyle}
          >
            <div style={modalContentStyle}>
              <h3 style={{ marginBottom: "10px", textAlign: "center" }}>
                Inning {selectedInning.inning} Details
              </h3>
              <div style={{ marginBottom: "20px" }}>
                <strong>{homeTeamDetails.name || home_team}:</strong>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  <li>Runs: {selectedInning.home.runs.runs}</li>
                  <li>Hits: {selectedInning.home.hits}</li>
                  <li>Errors: {selectedInning.home.errors}</li>
                  <li>Left On Base: {selectedInning.home.runs.leftOnBase}</li>
                </ul>
                <hr style={{ borderColor: "#444", margin: "10px 0" }} />
                <strong>{awayTeamDetails.name || away_team}:</strong>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  <li>Runs: {selectedInning.away.runs.runs}</li>
                  <li>Hits: {selectedInning.away.hits}</li>
                  <li>Errors: {selectedInning.away.errors}</li>
                  <li>Left On Base: {selectedInning.away.runs.leftOnBase}</li>
                </ul>
              </div>
              <motion.button
                onClick={() => setSelectedInning(null)}
                whileHover={{ scale: 1.05, backgroundColor: "#FFDD00", color: "#000" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  ...neumorphicButtonStyle,
                  margin: "0 auto",
                  display: "block",
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------
          Modal: Single Team
      ---------------------- */}
      <AnimatePresence>
        {selectedTeamInning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={modalBackdropStyle}
          >
            <div style={modalContentStyle}>
              <h3 style={{ marginBottom: "10px", textAlign: "center" }}>
                Inning {selectedTeamInning.inning.inning} -{" "}
                {selectedTeamInning.team === "home"
                  ? homeTeamDetails.name || home_team
                  : awayTeamDetails.name || away_team}{" "}
                Details
              </h3>
              <div style={{ marginBottom: "15px" }}>
                <strong>Summary:</strong>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {selectedTeamInning.team === "home" ? (
                    <>
                      <li>Runs: {selectedTeamInning.inning.home.runs.runs}</li>
                      <li>Hits: {selectedTeamInning.inning.home.hits}</li>
                      <li>Errors: {selectedTeamInning.inning.home.errors}</li>
                      <li>Left On Base: {selectedTeamInning.inning.home.runs.leftOnBase}</li>
                    </>
                  ) : (
                    <>
                      <li>Runs: {selectedTeamInning.inning.away.runs.runs}</li>
                      <li>Hits: {selectedTeamInning.inning.away.hits}</li>
                      <li>Errors: {selectedTeamInning.inning.away.errors}</li>
                      <li>Left On Base: {selectedTeamInning.inning.away.runs.leftOnBase}</li>
                    </>
                  )}
                </ul>
              </div>
              <motion.button
                onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                whileHover={{ scale: 1.05, backgroundColor: "#FFDD00", color: "#000" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  ...neumorphicButtonStyle,
                  marginBottom: "15px",
                }}
              >
                {showDetailedInfo ? "Hide Detailed Info" : "Detailed Info"}
              </motion.button>
              {showDetailedInfo && (
                <div style={{ marginBottom: "15px" }}>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {selectedTeamInning.team === "home" ? (
                      <>
                        <li>Runs: {selectedTeamInning.inning.home.runs.runs}</li>
                        <li>Hits: {selectedTeamInning.inning.home.hits}</li>
                        <li>Errors: {selectedTeamInning.inning.home.errors}</li>
                        <li>Left On Base: {selectedTeamInning.inning.home.runs.leftOnBase}</li>
                      </>
                    ) : (
                      <>
                        <li>Runs: {selectedTeamInning.inning.away.runs.runs}</li>
                        <li>Hits: {selectedTeamInning.inning.away.hits}</li>
                        <li>Errors: {selectedTeamInning.inning.away.errors}</li>
                        <li>Left On Base: {selectedTeamInning.inning.away.runs.leftOnBase}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
              <motion.button
                onClick={() => setSelectedTeamInning(null)}
                whileHover={{ scale: 1.05, backgroundColor: "#FFDD00", color: "#000" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  ...neumorphicButtonStyle,
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -------------------------
// EXTRA STYLES
// -------------------------
const parentContainerStyle = {
  position: "relative",
  width: "100%",
  height: "100vh", // full viewport height
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalBackdropStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
  padding: "20px",
};

const modalContentStyle = {
  backgroundColor: "#222",
  padding: "20px",
  borderRadius: "12px",
  width: "80%",
  maxWidth: "600px",
  boxShadow: "0 0 20px rgba(0,0,0,0.9)",
  color: "#fff",
  textAlign: "left",
};
