from core.services.gameServices import get_full_llm_feed
from core.services.gameServices import save_to_file

import google.generativeai as genai
from core.services.gameServices import get_full_llm_feed
import json
from core.services.gameServices import get_game_video_highlights, textify_game_teams_names_and_ids
from core.services.voiceGenServices import invokeElevenLabGeneration
from core.services.gcloudServices import *
from mutagen.mp3 import MP3
from vertexai.generative_models import GenerativeModel, Part
systemMessage = """
**Task Overview:**  
Generate a **two-minute (~250 words)** professional-style commentary **rewind** of an MLB game, making it sound like a high-quality sports recap. The narration should be **engaging, concise, and structured**, starting with a greeting, followed by a **quick game recap**, and then focusing on the **key plays and highlights**.  

#### **Key Considerations:**  
- Use a **professional tone** similar to TV sports commentators.  
- Ensure **fluid storytelling** that smoothly transitions from one moment to another.  
- Incorporate **multiple tools**, not just highlight videos, to ensure a well-rounded recap.  
- **Video Length Awareness**: Some highlight videos are long. **Only include videos that reasonably fit within a two-minute narration** while keeping the commentary balanced.  
- The narration language should be the one that the user has selected. Only the narration should be in the selected language.
- Every section must have a UI component. You can choose the most appropriate component based on the content of the section.
- You must include atleast one Team Leader section in the commentary.
- Since the UI component is always shown in the beginning of the section , if you want to tell the users to look at something, do it in the beginning of the section narration to make it more natural.
---

### **Output Structure:**  
Make sure you follow the json structure strictly and do not change any of the key names.
The generated response should follow this JSON format:


{
	"Sections": [
		{
            "id": <int> (section incremental ID for each section, must start from 0, and needs to be included.)",
			"narration": "<string> (A professional and engaging commentary for this section)",
			"UIComponent": <UIComponent>
		}, and so on...
	]
}


---

### **Available UI Components:**  
Use these components **strategically** to create a compelling and structured game rewind.

1. **GameInfoCard**  
   _Provides general game details such as teams, location, and timing. Best used at the beginning._  
   
   {
       "type": "GameInfoCard",
       "gameId": "<string>",
       "homeTeamId": "<string>",
       "awayTeamId": "<string>"
   }
   
  
2. **LineBox**  
   _Shows the line score of the game. Use this to highlight overall scoring trends._  
   
   {
       "type": "LineBox",
       "gameId": "<string>",
       "currentInning": <int> (If this section talks about a specific inning, put that inning number. If summarizing multiple innings, use -1.)
   }
   

3. **PlayerCard**  
   _Displays details about a specific player. Use when highlighting a player's individual performance._  
   
   {
       "type": "PlayerCard",
       "playerId": "<string>",
       "playerMatchSummary": "<string>" (Optional: A brief 1-2 sentence summary of the player's performance & role in the game.)
   }
   

4. **HighlightVideo**  
   _Shows a specific highlight moment from the game._  The video should focus on key moments and the length of the highlight chosen shoudl match the commentary generated. Assume a reasonable wpm for the narration that corresponds to the video length.
   
   {
       "type": "HighlightVideo",
       "gameId": "<string>",
       "index": <int> (Use the given data to insert the correct video index.)
       "startTime": "<string>" (The start time of the highlight in HH:MM:SS format.)
       "endTime": "<string>" (The end time of the highlight in HH:MM:SS format.)
   }
   

5. **TeamLeaders**  
   _Shows a season's team leaders. might be useful to talk about a player if they are the team leader that season_  
   {
       "type": "TeamLeaders",
       "teamId": "<string>",(use the given data to insert the correct team id of the team you want to focus on. not the game id.)
       "season": "<string>" ,(use the given data to insert the correct season)
       "gameType": "<string>" (use the given data to insert the correct game type)
   }
   

---

### **Commentary Flow:**  
The generated narration should follow this **structured order**:

1. **Opening Greeting (GameInfoCard)**  
   - Introduce the game (who played, where, final score).  
   - Set the stage for an engaging recap.  

2. **Quick Game Recap (LineBox + Key Plays)**  
   - Summarize how the game progressed (e.g., early lead, comebacks, momentum shifts).  
   - Use **LineBox** to reinforce key scoring moments.  

3. **Key Moments & Highlights (HighlightVideo + PlayerCard + Charts)**  
   - Pick **impactful plays** and describe them in a **dramatic, engaging way**.  
   - Use **HighlightVideo** to showcase game-changing moments.  
   - **Pitching performances? Use PlayerCard.**  
   - **Big hits? Use Charts if available.**  

4. **Closing & Takeaways (LineBox or Summary)**  
   - Conclude with a strong **wrap-up** that captures the biggest takeaways from the game.  
   - Optionally use **LineBox** to display final game stats.  

---

### **Example Narration Flow in JSON Format:**

output shoudld be directly as below: 

{
	"Sections": [
		{
            "id": 0,
			"narration": "Welcome to the rewind of an intense battle between the St. Louis Cardinals and the Miami Marlins at loanDepot park! It was a game of momentum swings, with the Marlins jumping out to an early lead, only for the Cardinals to storm back with key plays.",
			"UIComponent": {
				"type": "GameInfoCard",
				"gameId": "634594"
			}
		}
	]
}


This ensures a **clear, structured**, and **well-balanced** game rewind with proper alignment between narration length and video duration.

Watch each video and then extract the time stamp such that it aligns with the overall length of the commentary. The order of the video files is the order of the video description with the index. 

Give me the json directly with NO ```json or code``` blocks.
Data : 

"""




def promptProcessor(game_id, focus_players, focus_areas, focus_teams, language):
    feed = get_full_llm_feed(game_id, focus_players, focus_areas, focus_teams, language)

    #make it a prompt template with sys instructions etc. 


    return feed

def initGemini():
    # Initialize the Gemini API
    genai.configure(api_key="")# add api here but for production it should be in the env variables
    model = genai.GenerativeModel("gemini-1.5-flash")
    return model


#1 generate commentary from fine tuned model 

def generateCommentaryWithGemini(data, model):
    # Initialize the Gemini API
    contents = [
        {
            "role": "user",  # Gemini only accepts "user" and "model" roles
            "parts": [{"text": systemMessage + "\n\n" + data}]
        }
    ]
    
    result = model.generate_content(contents).text
    

    #save_to_file(result, "result.txt")
    return result



# model = initGemini()
# resultant = generateCommentaryWithGemini(promptProcessor("634594", ["Nolan Arenado", "Paul Goldschmidt"], ["batting", "pitching"], ["St. Louis Cardinals", "Miami Marlins"]), model)
# resultant = resultant.strip()
# print(resultant)
# resultantJson = json.loads(resultant)


# for section in resultantJson["Sections"]:
#     narration = section["narration"]
#     audioPath = invokeElevenLabGeneration(narration)
#     mp3file = MP3(audioPath)
#     mp3Length = mp3file.info.length

#     audioName = audioPath.split("/")[-1]
#     public_url = upload_audio_to_gcs(audioPath, "audiocommentary", audioName)


# #2 answer questions about a specific game 



# #3



#4



#5



