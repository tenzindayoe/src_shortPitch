import { Sequence, AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { TransitionSeries } from "@remotion/transitions";
import { flip } from "@remotion/transitions/flip";
import { linearTiming } from "@remotion/transitions";
import { Dialogue } from './components/Dialogue';
import { LineBox } from './components/LineBox';
import { PlayerCard } from './components/PlayerCard';
import { GameInfoCard } from './components/GameInfoCard';
import { HighlightVideo } from './components/HighlightVideo';
import { TeamLeaders } from './components/TeamLeaders';
import { Fragment } from 'react';
import { FaPause, FaPlay, FaRedo, FaExpand } from 'react-icons/fa';
import { useEffect, useState } from 'react';
export const DynamicVideo = ({ data}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const [currentDialogueURL, setCurrentDialogueURL] = useState(null);
  if (!data || !data.video) {
    return (
      <AbsoluteFill style={{ backgroundColor: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>No Data Found</h2>
      </AbsoluteFill>
    );
  }

  data.video.forEach(section => {
    if (typeof section.section_id !== "string") {
      section.section_id = String(section.section_id);
    }
  });

  useEffect(() => {
    console.log("Data", data);
  }, [data]);
  
  const fadeInDuration = 2 * fps;
  const fadeOutStart = durationInFrames - 2 * fps;
  const volume = interpolate(frame, [0, fadeInDuration, fadeOutStart, durationInFrames], [0, 0.2, 0.2, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Background Music */}
      {data.background_music_url && (
        <Audio
          src={data.background_music_url}
          volume={volume}
          startFrom={0}
          loop
        />
      )}

      {/* Top Section: Video and Components with Flip Transition */}
      <div style={{ flex: 2, borderRadius: '20px', overflow: 'hidden', backgroundColor: 'black', margin: '20px', position: 'relative' }}>
        <TransitionSeries>
          {data.video.map((section, index) => {
            const startFrame = index === 0 
              ? 0 
              : Math.round(data.video.slice(0, index).reduce((acc, s) => acc + s.section_duration * fps, 0));

            return (
              <Fragment key={`fragment-${section.section_id}`}>
                <TransitionSeries.Sequence key={`scene-${section.section_id}`} durationInFrames={Math.round(section.section_duration * fps) + 30}>
                  
                    <AbsoluteFill>
                      {section.section_components.map((component, idx) => {
                        switch (component.type) {
                          case "Dialogue":
                            return <Dialogue key={idx} url={component.url} setCurrentDialogueURL={setCurrentDialogueURL}/>;
                          case "LineBox":
                            return <LineBox key={idx} data={component.data} />;
                          case "PlayerCard":
                            return <PlayerCard key={idx} data={component.data} />;
                          case "GameInfoCard":
                            return <GameInfoCard key={idx} data={component.data} />;
                          case "HighlightVideo":
                            return <HighlightVideo key={idx} data={component.data} />;
                          case "TeamLeaders":
                            return <TeamLeaders key={idx} data={component.data} />;
                          default:
                            return null;
                        }
                      })}
                    </AbsoluteFill>
                </TransitionSeries.Sequence>

                {/* Apply Flip Transition Between Sections */}
                <TransitionSeries.Transition
                  presentation={flip({ direction: "from-left" })}  // Flip transition
                  timing={linearTiming({ durationInFrames: 30 })} // 30-frame transition
                />
              </Fragment>
            );
          })}
        </TransitionSeries>
      </div>

      {/* Bottom Section: Audiogram and Title */}
      <div style={{ flex: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
     
      </div>
      
    </AbsoluteFill>
  );
};
