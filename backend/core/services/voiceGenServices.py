
import os
import uuid
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from mutagen.mp3 import MP3
from core.services.audioModifyServices import normalize_audio

from core.services.languageService import languageVoiceMapping
ELEVENLABS_API_KEY = ""# put your eleven labs api key here for testing for production use environment variables


def createAudioFromText(dialogueText, voiceType, sessionId):
    
    audioPath = invokeElevenLabGeneration(dialogueText)
    gcsPath = uploadAudioToGCS(audioPath, "audio-bucket", sessionId)



def invokeElevenLabGeneration(dialogueText, language): 
    # Uses Eleven Lab TTS. Do not call this function. For internal use only.
    audioFile = textToAudio(dialogueText, language)
    audioPath = saveAudioToFile(audioFile)
    return audioPath



def uploadAudioToGCS(audioPath, bucketName, fileName):
    # Uploads audio to GCS. Do not call this
    #  function. For internal use only.
    # retursn the GCS path of the audio file
    return ""





client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)



voice1 = "Uq9DKccXXKZ6lc53ATJV"
voice2 = "sfmzdbhtmFeQb5D4tEio"
voice3 = "0m1WGWVzxS7KbWobXtnw"
model1 = "eleven_turbo_v2"
model2 = "eleven_turbo_v2_5"
def textToAudio(text, language):

    if language not in languageVoiceMapping:
        raise ValueError(f"Voice for language {language} not found")
    voice = languageVoiceMapping[language]

    response = client.text_to_speech.convert(
        voice_id=voice,
        output_format="mp3_22050_32",
        text=text,
        model_id=model2, # use the turbo model for low latency
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.7,
            style=0.1,
            # use_speaker_boost=True,
        ),
    )

    
    return response

def saveAudioToFile(response, key=None):
    # save in folder (or create one if doesn't exist) called tempAudio
    if key is None:
        key = ""
    folder_path = "tempAudio"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    
    save_file_path = os.path.join(folder_path, f"{uuid.uuid4()}_{key}.mp3")
    processed_file_path = os.path.join(folder_path, f"{uuid.uuid4()}_{key}_processed.mp3")
    
    with open(save_file_path, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)
    
    # Normalize the audio
    normalize_audio(save_file_path, processed_file_path)
                
    return processed_file_path
