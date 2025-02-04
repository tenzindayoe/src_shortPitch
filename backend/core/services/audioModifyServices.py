from pydub import AudioSegment
import os

def normalize_audio(input_path, output_path, target_dBFS=-3.0):
    """Normalize an audio file to the target dBFS (decibels relative to full scale)."""
    audio = AudioSegment.from_file(input_path)
    
    # Calculate the difference between target dBFS and current loudness
    change_in_dBFS = target_dBFS - audio.max_dBFS
    
    # Apply the gain change
    normalized_audio = audio.apply_gain(change_in_dBFS)
    
    # Export the normalized file
    normalized_audio.export(output_path, format="mp3")