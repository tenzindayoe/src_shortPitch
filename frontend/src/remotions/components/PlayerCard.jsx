import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const PlayerCard = ({ data }) => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  // Helper: Dynamically load an external script.
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
    const initializeVanta = async () => {
      try {
        // Load Three.js if not already loaded.
        if (!window.THREE) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        }
        // Load Vanta Dots effect if not already loaded.
        if (!window.VANTA || !window.VANTA.DOTS) {
          await loadScript("https://cdn.jsdelivr.net/npm/vanta/dist/vanta.dots.min.js");
        }
        // Initialize the Vanta.DOTS effect with your exact parameters.
        if (vantaRef.current && window.VANTA && window.VANTA.DOTS) {
          const effect = window.VANTA.DOTS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            size: 3.10,
            spacing: 41.00,
            showLines: false,
          });
          setVantaEffect(effect);
        }
      } catch (err) {
        console.error("Error initializing Vanta.DOTS:", err);
      }
    };

    initializeVanta();

    // Cleanup on unmount.
    return () => {
      if (vantaEffect && vantaEffect.destroy) {
        vantaEffect.destroy();
      }
    };
  }, []); // empty dependency array ensures initialization only once

  if (!data || !data.data) {
    return (
      <div style={parentContainerStyle}>
        <div style={cardStyle}>⚠️ No Player Data Available</div>
      </div>
    );
  }

  const player = data.data;

  return (
    // The parent container fills the viewport and is used by Vanta as its element.
    <div ref={vantaRef} style={parentContainerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={cardStyle}
      >
        {/* Left Section: Player Profile */}
        <div style={leftSection}>
          <motion.img
            src={player.headshot_url}
            alt={player.name}
            style={imageStyle}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <h2 style={headingStyle}>
            {player.name} ({player.nickname})
          </h2>
          <p>
            <strong>Position:</strong> {player.position}
          </p>
          <p>
            <strong>Age:</strong> {player.age}
          </p>
          <p>
            <strong>Height:</strong> {player.height}
          </p>
          <p>
            <strong>Weight:</strong> {player.weight} lbs
          </p>
          <p>
            <strong>Bats/Throws:</strong> {player.bats} / {player.throws}
          </p>
          <p>
            <strong>Years in MLB:</strong> {player.years_in_mlb}
          </p>
          <a
            href={player.mlb_profile_url}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            MLB Profile
          </a>
        </div>

        {/* Right Section: Match Summary */}
        <div style={rightSection}>
          <h3 style={subHeadingStyle}>Match Summary</h3>
          <p style={summaryTextStyle}>{data.playerMatchSummary}</p>
        </div>
      </motion.div>
    </div>
  );
};

/* -----------------------
   Styles
-------------------------*/

// Parent container that fills the viewport.
const parentContainerStyle = {
  position: "relative",
  width: "100%",
  height: "100vh", // Ensure full viewport height
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0", // Remove extra padding to prevent reflow issues
};

// Neumorphic, translucent card that sits above the Vanta canvas.
const cardStyle = {
  position: "relative",
  zIndex: 2, // Ensure the card is above the background
  display: "flex",
  flexDirection: "row",
  width: "90%",
  maxWidth: "800px",
  padding: "20px",
  borderRadius: "15px",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  boxShadow: "8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.1)",
  color: "white",
};

// Left section: Player profile.
const leftSection = {
  flex: 1,
  paddingRight: "15px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
};

// Right section: Match summary.
const rightSection = {
  flex: 1,
  paddingLeft: "15px",
  borderLeft: "2px solid rgba(255, 255, 255, 0.4)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

// Profile image style.
const imageStyle = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  border: "2px solid #1E90FF",
  marginBottom: "10px",
};

// Link style.
const linkStyle = {
  color: "#1E90FF",
  textDecoration: "none",
  fontWeight: "bold",
  marginTop: "10px",
  display: "inline-block",
};

// Heading style for the player name.
const headingStyle = {
  margin: "0 0 10px 0",
  fontSize: "1.5rem",
};

// Subheading style for the match summary title.
const subHeadingStyle = {
  marginBottom: "10px",
  fontSize: "1.75rem",
  color: "#ffcc00", // Accent color
  borderBottom: "2px solid rgba(255, 204, 0, 0.5)",
  paddingBottom: "5px",
};

// Summary text style.
const summaryTextStyle = {
  fontSize: "1.2rem",
  lineHeight: "1.6",
  margin: 0,
};