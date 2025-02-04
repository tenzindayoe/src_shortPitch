import React, { useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate, animate } from 'framer-motion';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const GameInfoCard = ({ data }) => {
  // ---------- Framer Motion: Background Animation ----------
  const COLORS = ['#13FFAA', '#1E67C6', '#CE84CF', '#DD335C'];
  const color = useMotionValue(COLORS[0]);

  useEffect(() => {
    const controls = animate(color, COLORS, {
      ease: 'easeInOut',
      duration: 10,
      repeat: Infinity,
      repeatType: 'mirror',
    });
    return controls.stop;
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

  // ---------- Remotion: Content Animation ----------
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animate the top section (logos and "vs") from frame 0 to 15.
  const topOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const topTranslateY = interpolate(frame, [0, 15], [-30, 0], { extrapolateRight: 'clamp' });

  // Animate the location text from frame 10 to 25.
  const locationOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const locationTranslateY = interpolate(frame, [10, 25], [-30, 0], { extrapolateRight: 'clamp' });

  // Animate the date/time text from frame 20 to 35.
  const dateOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });
  const dateTranslateY = interpolate(frame, [20, 35], [-30, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* ---------- Background Layers using Framer Motion ---------- */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage,
          backgroundSize: 'cover',
        }}
      />
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent)',
          backgroundSize: '200% 200%',
          opacity: 0.5,
          zIndex: 1,
        }}
      />

      {/* ---------- Content Container (animated using Remotion) ---------- */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: 'transparent',
          color: '#fff',
        }}
      >
        {/* Top Section: Home Team, "vs", Away Team */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '40px',
            opacity: topOpacity,
            transform: `translateY(${topTranslateY}px)`,
          }}
        >
          {/* Home Team Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={data.homeTeamLogoURL}
              alt={data.homeTeamName}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #fff',
              }}
            />
            <p style={{ marginTop: '8px', fontSize: '20px', fontWeight: 'bold', color: '#FFDD00' }}>
              {data.homeTeamName}
            </p>
          </div>
          {/* "vs" Text */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#FFDD00',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            vs
          </h1>
          {/* Away Team Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={data.awayTeamLogoURL}
              alt={data.awayTeamName}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #fff',
              }}
            />
            <p style={{ marginTop: '8px', fontSize: '20px', fontWeight: 'bold', color: '#FFDD00' }}>
              {data.awayTeamName}
            </p>
          </div>
        </div>

        {/* Middle Section: Location */}
        <div
          style={{
            fontSize: '28px',
            color: '#E0E0E0',
            marginBottom: '20px',
            opacity: locationOpacity,
            transform: `translateY(${locationTranslateY}px)`,
          }}
        >
          <p>
            <strong>Location:</strong> {data.location}
          </p>
        </div>

        {/* Bottom Section: Date & Time */}
        <div
          style={{
            fontSize: '28px',
            color: '#E0E0E0',
            opacity: dateOpacity,
            transform: `translateY(${dateTranslateY}px)`,
          }}
        >
          <p>
            <strong>Date &amp; Time:</strong> {new Date(data.dateAndTime).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
