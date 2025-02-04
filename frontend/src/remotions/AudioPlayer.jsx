import React, { useRef, useState, useEffect } from 'react';

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event) => {
    const newTime = event.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div style={styles.container}>
      <button onClick={togglePlay} style={styles.button}>
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>

      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        style={styles.slider}
      />
      
      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        style={styles.volumeSlider}
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: '#333',
    color: 'white',
    borderRadius: '8px',
 
  }};