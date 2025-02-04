import { useEffect } from 'react';
import { Audio } from 'remotion';

export const Dialogue = ({ url , setCurrentDialogueURL}) => {
  if (!url) return null; // ✅ Prevents rendering if no URL
  


  useEffect(() => {
    setCurrentDialogueURL(url);
  }
  , [url, setCurrentDialogueURL]);

  return (
    <Audio
      src={url}
      volume={1}
      startFrom={0} // Plays immediately when the section starts
    />
  );
};
