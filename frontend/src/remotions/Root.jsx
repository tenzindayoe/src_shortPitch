import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Compositions';
import { DynamicVideo } from './DynamicVideo';

export const RemotionRoot = () => {
    const exampleData = {
        id: "video1",
        total_duration: 15,
        background_music_url: "https://download.samplelib.com/mp3/sample-6s.mp3",
        video: [
          {
            section_id: "section1",
            section_duration: 5,
            section_components: [
              { type: "Dialogue", url: "https://download.samplelib.com/mp3/sample-6s.mp3" },
              { type: "PlayerCard", data: { name: "John Doe", id: "123", team: "Warriors" } }
            ]
          },
          {
            section_id: "section2",
            section_duration: 5,
            section_components: [
              { type: "GameInfoCard", data: { gameId: "game123", location: "New York", dateAndTime: "2025-01-01", homeTeamName: "Knicks", awayTeamName: "Lakers" } },
              { type: "HighlightVideo", data: { gameId: "game123", title: "Amazing Dunk", url: "https://download.samplelib.com/mp4/sample-5s.mp4" } }
            ]
          }
        ]
      };

  return (
    <>
      {/* Register Text Sequence Composition */}
      <Composition
        id="TextSequence"
        component={MyComposition}
        durationInFrames={180} // 3 sequences * 60 frames each
        fps={30}
        width={1280}
        height={720}
      />

      {/* Register Dynamic Video Composition */}
      <Composition
        id="DynamicVideo"
        component={DynamicVideo}
        durationInFrames={exampleData.total_duration * 30} // Convert seconds to frames
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ data: exampleData }} // Pass example data
      />
    </>
  );
};
