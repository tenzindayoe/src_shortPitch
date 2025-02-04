import { Sequence } from 'remotion';
import { TextAnimation } from './TextAnimation.jsx';
import {  AbsoluteFill } from 'remotion';
import {Audio} from 'remotion';

export const MyComposition = () => (
  <AbsoluteFill style={{ backgroundColor: 'black' }}>
    {/* Floating text effect running in the background for the entire video */}
    
    <Audio src="https://d38nvwmjovqyq6.cloudfront.net/va90web25003/companions/Foundations%20of%20Rock/13.02.mp3"/>

    {/* Sequence of animations appearing one after another */}
    <Sequence from={0} durationInFrames={60}>
      <TextAnimation text="Hello, World!" />
    </Sequence>

    <Sequence from={60} durationInFrames={60}>
      <TextAnimation text="Welcome to Remotion!" />
    </Sequence>

    <Sequence from={120} durationInFrames={60}>
      <TextAnimation text="Let's create amazing videos!" />
    </Sequence>
  </AbsoluteFill>
);
