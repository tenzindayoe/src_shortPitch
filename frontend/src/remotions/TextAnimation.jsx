import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const TextAnimation = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animation for fade-in effect
  const opacity = spring({
    frame,
    fps,
    config: { damping: 10 },
  });

  return (
    <div style={{
      fontSize: 60,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
      backgroundColor: 'black',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
    }}>
      {text}
    </div>
  );
};
