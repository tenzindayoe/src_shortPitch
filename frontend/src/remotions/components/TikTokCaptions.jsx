import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { createTikTokStyleCaptions } from '@remotion/captions';

// Define your captions array
const captions = [
  {
    text: 'Welcome',
    startMs: 500,
    endMs: 1000,
    timestampMs: 750,
    confidence: null,
  },
  {
    text: 'to',
    startMs: 1000,
    endMs: 1500,
    timestampMs: 1250,
    confidence: null,
  },
  {
    text: 'Remotion!',
    startMs: 1500,
    endMs: 2500,
    timestampMs: 2000,
    confidence: null,
  },
];

// Use createTikTokStyleCaptions with a very low combine threshold so that each token is its own page.
const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1,
});

export const TikTokCaptions = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {pages.map((page, index) => {
        // Use the last token to compute the duration of this page.
        const lastToken = page.tokens[page.tokens.length - 1];
        const durationMs = lastToken.toMs - page.startMs;
        const durationInFrames = Math.round((durationMs / 1000) * fps);

        return (
          <Sequence
            key={index}
            from={Math.round((page.startMs / 1000) * fps)}
            durationInFrames={durationInFrames}
          >
            <div
              style={{
                fontSize: '48px',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '10px 20px',
                borderRadius: '8px',
                position: 'absolute',
                bottom: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'pre',
              }}
            >
              {page.text}
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
