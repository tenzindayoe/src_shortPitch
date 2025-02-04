from core.services.gameServices import uicomponentProcessor
from core.services.gcloudServices import upload_audio_to_gcs
from core.services.llmServices import initGemini, generateCommentaryWithGemini, promptProcessor
import json
from mutagen.mp3 import MP3
from core.services.llmServices import save_to_file
from core.services.redisCacheService import get_cached_data, cache_data
from core.services.voiceGenServices import invokeElevenLabGeneration
from core.services.vidLLMServices import generate_video_timestamps

from datetime import datetime

def format_timestamp(timestamp):
    try:
        # Try parsing as HH:MM:SS first
        datetime.strptime(timestamp, "%H:%M:%S")
        return timestamp  # Already in correct format
    except ValueError:
        try:
            # Try parsing as MM:SS and convert
            dt = datetime.strptime(timestamp, "%M:%S")
            return dt.strftime("00:%M:%S")
        except ValueError:
            raise ValueError(f"Invalid timestamp format: {timestamp}")



def get_game_commentary(game_id, focus_players, focus_areas, focus_teams, music_url, language):
    
    model = initGemini()
    resultant = generateCommentaryWithGemini(promptProcessor(game_id=game_id, focus_players=focus_players,focus_areas=focus_areas, focus_teams=focus_teams, language=language), model)
    resultant = resultant.strip()
    resultantJson = json.loads(resultant)
    cacheKey = game_id + "_" + "_".join(focus_players) + "_" + "_".join(focus_areas) + "_" + "_".join(focus_teams)+ "_" + language
    
    if(get_cached_data(cacheKey) is not None):
        return json.loads(get_cached_data(cacheKey))
    
    clientData = {
        "id": game_id,
        "total_duration":0,
        "background_music_url": music_url,
        "video":[
           
        ]
    }
    for section in resultantJson["Sections"]:
        

        narration = section["narration"]
        audioPath = invokeElevenLabGeneration(narration, language)
        mp3file = MP3(audioPath)
        mp3Length = mp3file.info.length

        audioName = audioPath.split("/")[-1]
        public_url = upload_audio_to_gcs(audioPath, "audiocommentary", audioName)
        
        
        dialogueComponent = {
                    "type":"Dialogue",
                    "url": public_url,
                    "duration" : mp3Length
                }
        if(section["UIComponent"] is None):
            print("UIComponent is None")
            print(section)
        uicomponent = uicomponentProcessor(section["UIComponent"])
        
        currentSection = {
            "section_id" : section["id"],
            "section_duration": mp3Length,
            "section_components":[
                dialogueComponent,
                uicomponent
            ]
        }
        
        if uicomponent["type"] == "HighlightVideo":
            try:
                vidStamps = json.loads((generate_video_timestamps(uicomponent["data"]["url"], narration, mp3Length)))
                vidStamps["start"] = format_timestamp(vidStamps["start"])
                vidStamps["end"] = format_timestamp(vidStamps["end"])
                uicomponent["data"]["vid_time"] = vidStamps

               
                #vidstamps is of the form {"start": HH:MM:SS, "end": HH:MM:SS}
                convertStartToSeconds = lambda x: int(x.split(":")[0])*3600 + int(x.split(":")[1])*60 + int(x.split(":")[2])
                start = convertStartToSeconds(vidStamps["start"])
                end = convertStartToSeconds(vidStamps["end"])
                vidDuration = end - start
                currentSection["section_duration"] = max(vidDuration, mp3Length)
            except Exception as e:
                print(uicomponent)
                print(e)
                
            
            
        clientData["video"].append(currentSection)
        clientData["total_duration"] += currentSection["section_duration"]

    cache_data(cacheKey, json.dumps(clientData))
    
    return clientData

    
# get_game_commentary("634594", ["Nolan Arenado", "Paul Goldschmidt"], ["batting", "pitching"], ["St. Louis Cardinals", "Miami Marlins"], "https://download.samplelib.com/mp3/sample-15s.mp3")