import os
import uuid

# Google Cloud TTS
from google.cloud import texttospeech

from mutagen.mp3 import MP3
from core.services.audioModifyServices import normalize_audio
from core.services.languageService import languageVoiceMapping

def createAudioFromText(dialogueText, language, sessionId):
    """
    Main entry point to create audio from text.
    Replaces 'invokeElevenLabGeneration' with Google TTS calls.
    """
    audioPath = invokeGoogleTTSGeneration(dialogueText, language)
    gcsPath = uploadAudioToGCS(audioPath, "audio-bucket", sessionId)
    return gcsPath

def invokeGoogleTTSGeneration(dialogueText, language):
    """
    Uses Google Cloud TTS to convert text to audio content, 
    then saves the audio to a file and returns the path.
    """
    audioContent = textToAudio(dialogueText, language)
    audioPath = saveAudioToFile(audioContent)
    return audioPath

def uploadAudioToGCS(audioPath, bucketName, fileName):
    """
    Uploads audio to GCS. 
    Replace this stub with your actual GCS upload logic.
    """
    # e.g. use google.cloud.storage to upload `audioPath`
    # Return the GCS URI of the uploaded file
    return ""

def textToAudio(text, language):
    """
    Converts text to speech using Google Cloud TTS.
    Adjust voices/params as desired, or pull from your `languageVoiceMapping`.
    """
    if language not in languageVoiceMapping:
        raise ValueError(f"Voice for language '{language}' not found.")
    
    # Example voice data from your languageVoiceMapping structure
    voice_data = languageVoiceMapping[language]  # e.g. {"language_code": "en-US", "voice_name": "en-US-Wavenet-D"}
    language_code = voice_data["language_code"]
    voice_name = voice_data["voice_name"]
    
    # Instantiate a Google Cloud TextToSpeech client
    client = texttospeech.TextToSpeechClient()

    # Set up the text and voice params
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice_params = texttospeech.VoiceSelectionParams(
        language_code=language_code,
        name=voice_name,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL  # or MALE/FEMALE
    )

    # Configure the audio settings
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    # Generate the speech
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice_params,
        audio_config=audio_config
    )

    return response.audio_content

def saveAudioToFile(audio_content, key=None):
    """
    Saves raw MP3 bytes to file, normalizes audio, and returns the path to the processed MP3.
    """
    if key is None:
        key = ""

    folder_path = "tempAudio"
    os.makedirs(folder_path, exist_ok=True)

    # Create file paths
    save_file_path = os.path.join(folder_path, f"{uuid.uuid4()}_{key}.mp3")
    processed_file_path = os.path.join(folder_path, f"{uuid.uuid4()}_{key}_processed.mp3")

    # Write MP3 content
    with open(save_file_path, "wb") as f:
        f.write(audio_content)

    # Normalize audio (depends on your custom logic)
    normalize_audio(save_file_path, processed_file_path)

    return processed_file_path
