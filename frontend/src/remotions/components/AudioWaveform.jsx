import React from "react";
import { Audio, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";


export const AudioWaveform = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!audioSrc) {

    return null;
  }

  
  
  // Always call the hook with a valid audio source
  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    return null;
  }

  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 128,
    optimizeFor: "speed",
    smoothing: true,
  });

  const freqRangeStartIndex = 2;
  const waveLinesToDisplay = 64;
  const mirrorWave = true;

  const frequencyDataSubset = visualization.slice(
    freqRangeStartIndex,
    freqRangeStartIndex + (mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay)
  );

  const frequenciesToDisplay = mirrorWave
    ? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
    : frequencyDataSubset;

  const waveColor = "#FACC15"; // Golden yellow

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Audio Waveform Visualization</h1>å
      {/* Audio playback */}
      <Audio src={validAudioSrc} />

      {/* Waveform visualization */}
      <div className="flex flex-row items-center justify-center gap-4 h-20 mt-8">
        {frequenciesToDisplay.map((amplitudeValue, i) => {
          const amplitude = 500 * Math.sqrt(amplitudeValue);

          return (
            <div
              key={i}
              className="rounded-lg"
              style={{
                minWidth: "7px",
                backgroundColor: waveColor,
                height: `${amplitude}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
