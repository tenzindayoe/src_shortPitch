import { Video, useVideoConfig } from 'remotion';

export const HighlightVideo = ({ data }) => {
    const { fps } = useVideoConfig();
    const { vid_time } = data;
    const { start, end } = vid_time;

    if (!data || !data.url) return <div className="text-white text-center">No video available</div>;

    // Function to convert HH:MM:SS into frames
    const timeToFrames = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return (hours * 3600 + minutes * 60 + seconds) * fps;
    };

    const startFrame = timeToFrames(start);
    const endFrame = timeToFrames(end);

    return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
            <Video
                src={data.url}
                className="absolute min-w-full min-h-full object-cover"
                startFrom={startFrame}
                endAt={endFrame}
                muted={false}
                volume={0.3}
            />
        </div>
    );
};
