
import requests
import statsapi
import requests
import json
import random
from mutagen.mp3 import MP3
import logging
from core.services.languageService import getLanguageFromCode
from core.services.teamServices import get_all_roster_ids, get_all_roster_names, get_team_logo_url,getTeamDetails
from core.services.playerServices import get_player_card_data
from core.services.teamServices import textify_team_leaders, get_team_leaders
# private --- ignore --- -
# Fetch all plays for a given match using game_pk
def fetch_game_data(game_pk):
    url = f"https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

# Extract play-by-play commentary data
def extract_highlights(data):
    all_plays = data["liveData"]["plays"]["allPlays"]
    highlights = {}

    for play in all_plays:
        description = play["result"].get("description", "")
        inning = play["about"].get("inning", "")
        half_inning = play["about"].get("halfInning", "")
        batter = play["matchup"].get("batter", {}).get("fullName", "")
        pitcher = play["matchup"].get("pitcher", {}).get("fullName", "")
        home_score = play["result"].get("homeScore", 0)
        away_score = play["result"].get("awayScore", 0)

        # Add hit data if available
        hit_data = play.get("hitData", {})
        launch_angle = hit_data.get("launchAngle") if hit_data.get("launchAngle") is not None else "N/A"
        exit_velocity = hit_data.get("launchSpeed") if hit_data.get("launchSpeed") is not None else "N/A"
        distance = hit_data.get("totalDistance") if hit_data.get("totalDistance") is not None else "N/A"

        # Add pitch data if available
        pitch_events = play.get("playEvents", [])
        pitches = []
        for event in pitch_events:
            pitch_data = event.get("pitchData", {})
            if pitch_data:
                pitches.append({
                    "type": event.get("details", {}).get("type", {}).get("description", "N/A"),
                    "speed": pitch_data.get("startSpeed") if pitch_data.get("startSpeed") is not None else "N/A",
                    "spinRate": pitch_data.get("breaks", {}).get("spinRate") if pitch_data.get("breaks", {}).get("spinRate") is not None else "N/A",
                    "breakAngle": pitch_data.get("breaks", {}).get("breakAngle") if pitch_data.get("breaks", {}).get("breakAngle") is not None else "N/A",
                })

        # Add runner movement if available
        runner_data = play.get("runners", [])
        runners = []
        for runner in runner_data:
            runners.append({
                "runner": runner.get("details", {}).get("runner", {}).get("fullName", "N/A"),
                "movement": runner.get("movement", {}).get("end", "N/A"),
                "event": runner.get("details", {}).get("event", "N/A"),
            })

        # Create a structured highlight entry
        highlight = {
            "half_inning": half_inning,
            "description": description,
            "batter": batter,
            "pitcher": pitcher,
            "home_score": home_score,
            "away_score": away_score,
            "details": {
                "launch_angle": launch_angle,
                "exit_velocity": exit_velocity,
                "distance": distance,
            },
            "pitches": pitches,
            "runners": runners,
        }

        if inning not in highlights:
            highlights[inning] = []
        highlights[inning].append(highlight)

    return highlights

# Format highlights into a structured text block suitable for LLM input
def format_highlights_for_llm(highlights):
    commentary = []

    for inning, plays in highlights.items():
        inning_block = [f"Inning {inning}:"]
        for play in plays:
            details = play["details"]
            pitches = play["pitches"]
            runners = play["runners"]

            pitch_details = "".join(
                [
                    f" Pitch: {pitch['type']}, Speed: {pitch['speed']} mph, Spin Rate: {pitch['spinRate']} rpm, Break Angle: {pitch['breakAngle']} degrees."
                    for pitch in pitches
                ]
            )

            runner_details = "".join(
                [
                    f" Runner: {runner['runner']} moved to {runner['movement']} via {runner['event']}."
                    for runner in runners
                ]
            )

            inning_block.append(
                f"  {play['half_inning'].capitalize()} - {play['description']} by {play['batter']} against {play['pitcher']}. "
                f"The ball had a launch angle of {details['launch_angle']} degrees, exit velocity of {details['exit_velocity']} mph, "
                f"and traveled {details['distance']} feet. The score is now Home: {play['home_score']}, Away: {play['away_score']}.{pitch_details}{runner_details}"
            )

        commentary.append("\n".join(inning_block))

    return "\n\n".join(commentary)


# Save formatted commentary to a text file
def save_to_file(content, filename="match_commentary.txt"):
    with open(filename, "w") as file:
        file.write(content)
    print(f"Commentary saved to {filename}")

#####_-------- end of private functions -----_##### 


# actual functions to be used in api



def get_processed_game_data(game_id):
    """
    Get processed game data using the game ID.
    """
    game_data = statsapi.boxscore_data(game_id)
    return game_data

def get_game_teams_ids(game_id):
    """
    Get the team IDs for a specific game using the game ID.
    """
    game_data = get_processed_game_data(game_id)
    home_team_id = game_data["home"]['team']["id"]
    away_team_id = game_data["away"]['team']["id"]
    return {
        "home_team_id": home_team_id,
        "away_team_id": away_team_id
    }

   
def get_game_teams_ids_via_box(data):
    homeTeam = data["teamInfo"]["home"]
    awayTeam = data["teamInfo"]["away"]
    homeTeamId = homeTeam["id"]
    awayTeamId = awayTeam["id"]
    return {
        "home_team_id": homeTeamId,
        "away_team_id": awayTeamId
    }
def textify_game_teams_names_and_ids(data):

    homeTeam = data["teamInfo"]["home"]
    awayTeam = data["teamInfo"]["away"]
    homeTeamName = homeTeam["shortName"]
    awayTeamName = awayTeam["shortName"]
    homeTeamId = homeTeam["id"]
    awayTeamId = awayTeam["id"]

    return f"Home Team: {homeTeamName} with Home Team ID : {homeTeamId}, Away Team: {awayTeamName} with Away Team ID : {awayTeamId}"



def get_game_players_info_text(game_id):
    teams = get_game_teams_ids(game_id)
    home_team_id = teams["home_team_id"]
    away_team_id = teams["away_team_id"]
    game_data = fetch_game_data(game_id)
    # look up team() from statsapi does not work with ids so we need to get the names of the teams another way
    home_team_name = game_data.get("gameData", {}).get("teams", {}).get("home", {}).get("name", "Home Team")
    away_team_name = game_data.get("gameData", {}).get("teams", {}).get("away", {}).get("name", "Away Team")

    home_team_roster_ids = get_all_roster_ids(home_team_id, game_id)
    away_team_roster_ids = get_all_roster_ids(away_team_id, game_id)
    home_team_roster_names = get_all_roster_names(home_team_id, game_id)
    away_team_roster_names = get_all_roster_names(away_team_id, game_id)
    text = ""
    text += f"Home Team: {home_team_name} with Home Team ID : {home_team_id}\n"
    for i in range(len(home_team_roster_ids)):
        text += f" Name: {home_team_roster_names[i]} & ID: {home_team_roster_ids[i]}, "
    text += "\n"
    text += f"Away Team: {away_team_name} with Away Team ID : {away_team_id}\n"
    for i in range(len(away_team_roster_ids)):
        text += f"Name: {away_team_roster_names[i]} & ID: {away_team_roster_ids[i]}, "

    return text

def get_game_info(game_id):
    data = fetch_game_data(game_id)
    if data:
        home_team = data.get("gameData", {}).get("teams", {}).get("home", {}).get("name", "Home Team")
        away_team = data.get("gameData", {}).get("teams", {}).get("away", {}).get("name", "Away Team")
        date_time = data.get("gameData", {}).get("datetime", {}).get("dateTime", "N/A")
        venue = data.get("gameData", {}).get("venue", {}).get("name", "N/A")
        weather = data.get("gameData", {}).get("weather", {}).get("condition", "N/A")

        return {
            "home_team": home_team,
            "away_team": away_team,
            "date_time": date_time,
            "venue": venue,
            "weather": weather
        }
    else:
        raise ValueError("Failed to fetch game data.")

def get_inning_by_inning_comms(game_pk):
    data = fetch_game_data(game_pk)
    if data:
        # Extract and format highlights
        home_team = data.get("gameData", {}).get("teams", {}).get("home", {}).get("name", "Home Team")
        away_team = data.get("gameData", {}).get("teams", {}).get("away", {}).get("name", "Away Team")
        date_time = data.get("gameData", {}).get("datetime", {}).get("dateTime", "N/A")
        venue = data.get("gameData", {}).get("venue", {}).get("name", "N/A")
        weather = data.get("gameData", {}).get("weather", {}).get("condition", "N/A")

        match_intro = (
            f"Match: {away_team} vs. {home_team}\n"
            f"Venue: {venue}\n"
            f"Date/Time: {date_time}\n"
            f"Weather: {weather}\n"
            f"Away: {away_team}\n"
            f"Home: {home_team}\n\n"
        )
        highlights = extract_highlights(data)
        formatted_commentary = format_highlights_for_llm(highlights)
        
        # Combine intro and highlights
        full_commentary = match_intro + formatted_commentary
        #save_to_file(full_commentary)
        return full_commentary
    else:
        raise ValueError("Failed to fetch game data.")


def getBoxScore(game_id):
    """
    Get the box score for a specific game using the game ID.
    """
    boxscore = statsapi.boxscore(game_id)
    return boxscore

def get_game_video_highlights(game_id):
    """
    Get video highlights for a specific game using the game ID.
    """
    video_highlights = statsapi.game_highlight_data(game_id)
    
    return video_highlights

def get_game_video_at_index(game_id, index):
    """
    Get video highlights for a specific game using the game ID.
    """
    video_highlights = statsapi.game_highlight_data(game_id)
    if video_highlights:
        return video_highlights[index]
    else:
        raise ValueError("Failed to fetch game video highlights.")
    


def serializeVideoInformation(game_id):
    video_highlights = get_game_video_highlights(game_id)
    videos = []
    index = 0 
    for rawVid in video_highlights:
       
        vidTitle = rawVid["title"] if "title" in rawVid else "Not Available"
        
        vidDescription = rawVid["description"] if "description" in rawVid else "Not Available"
        vidHeadline = rawVid["headline"] if "headline" in rawVid else "Not Available"
        for pb in rawVid["playbacks"]:
            if pb["name"] == "mp4Avc":
                vidLink = pb["url"] if "url" in pb else "Not Available"
                break
        
        vidDuration = rawVid["duration"]  if "duration" in rawVid else "Not Available"
        if vidLink == "Not Available":
            continue
        videos.append({
            "index" : index,
            "link": vidLink,
            "title": vidTitle,
            "description": vidDescription,
            "duration": vidDuration,
            "headline": vidHeadline
        })
        index += 1

    return videos

    
    #fields : 

def textifyGameVideoHighlights(game_id):
    serializedVideoInfo = serializeVideoInformation(game_id)
    textified = ""
    for vid in serializedVideoInfo:
        currentVideo = ""
        currentVideo += f"Index: {vid['index']}, "
        currentVideo += f"Title: {vid['title']}, "
        currentVideo += f"Description: {vid['description']}, "
        currentVideo += f"Duration: {vid['duration']}, "
        currentVideo += f"Headline: {vid['headline']}, "
        textified += currentVideo + "\n"
    return textified

def get_game_full_Info_qa(game_id):
    bxData = getBoxScore(game_id)

    #bx data is a string that  contains special characer that need to be applied, like \n should be replaced with new line
    bxData = bxData.replace("\n", "\n ")
    bxData = str(bxData)
    ibiData = get_inning_by_inning_comms(game_id)
    videoData = textifyGameVideoHighlights(game_id)
    
    lineScoreText = get_linescore_text(game_id)
    playerLineup = get_game_players_info_text(game_id)

    formattedResult ="Game ID : " + str(game_id) + "\n\n"+ "Player Data with ID " + "\n\n" +playerLineup + "\n\n"+ "Line Score Information" + "\n" + lineScoreText + "\n\n" + "Inning by Inning Commentary: \n" + ibiData + "\n\n" + " \n Video Highlights: \n " + videoData

    
    return formattedResult

def textifyBothTeamLeaders(home_team_id, away_team_id, season, gameType):
    homeTeamLeaders = textify_team_leaders(team_id=home_team_id, season=season, gameType=gameType)
    awayTeamLeaders = textify_team_leaders(team_id=away_team_id, season=season, gameType=gameType)
    return homeTeamLeaders + "\n\n" + awayTeamLeaders

def get_full_llm_feed(game_id, focus_players=[], focus_areas=[], focus_teams=[], language="en"):

    bxData = getBoxScore(game_id)
    bxDataDict = statsapi.boxscore_data(game_id)

    season = statsapi.get('game', {'gamePk': 634594})["gameData"]["datetime"]["officialDate"].split("-")[0]
    gameType = statsapi.get('game', {'gamePk': 634594})["gameData"]["game"]["type"]
    # teams = textify_game_teams_names_and_ids(bxDataDict)
    teamIds = get_game_teams_ids_via_box(bxDataDict)

    #bx data is a string that  contains special characer that need to be applied, like \n should be replaced with new line
    bxData = bxData.replace("\n", "\n ")

    bxData = str(bxData)
    ibiData = get_inning_by_inning_comms(game_id)
    videoData = textifyGameVideoHighlights(game_id)
    userPreference = process_user_preference(focus_players, focus_areas, focus_teams)
    lineScoreText = get_linescore_text(game_id)
    playerLineup = get_game_players_info_text(game_id)
    teamsLeaders = textifyBothTeamLeaders(teamIds["home_team_id"], teamIds["away_team_id"], season, gameType)

    languagePrompt = process_user_language(language)

    formattedResultExtended = userPreference + "\n" + "Box Score: \n" + bxData + "\n\n"+ "Player Data with ID " + "\n\n" +playerLineup + "\n\n"+ "Line Score Information" + "\n" + lineScoreText + "\n\n" + "Inning by Inning Commentary: \n" + ibiData + "\n\n" + " \n Video Highlights: \n " + videoData
    formattedResult ="Game ID : " + str(game_id) + "\n\n" +userPreference + "\n\n"+"\n\n"+teamsLeaders + languagePrompt+ "\n\n"+ "Player Data with ID " + "\n\n" +playerLineup + "\n\n"+ "Line Score Information" + "\n" + lineScoreText + "\n\n" + "Inning by Inning Commentary: \n" + ibiData +"\n\n" + " \n Video Highlights: \n " + videoData 

    save_to_file(formattedResult, "part.txt")
    return formattedResult




def process_user_language(language):
    langObject = getLanguageFromCode(language)
    prompt = "The user requested the commentary in " + langObject["name"] + " language."
    return prompt

def process_user_preference(focus_players, focus_areas, focus_teams):
    textForm = ""
    if len(focus_teams) > 0:
        textForm += "The user wants you to focus on these teams : "
        for team in focus_teams:
            textForm += team + ", "
        textForm += "\n"

    if len(focus_players) > 0:
        textForm += "The user wants you to focus on these players : "
        for player in focus_players:
            textForm += player + ", "
        textForm += "\n"

    if len(focus_areas) > 0:
        textForm += "The user wants you to focus on these areas : "
        for area in focus_areas:
            textForm += area + ", "
        textForm += "\n"
    
    return textForm

def get_linescore(game_id):
    """
    Get the inning-by-inning linescore for a specific game using the game ID.
    """
    data = fetch_game_data(game_id)
    if data:
        linescore = extract_linescore(data)
        return linescore
    else:
        raise ValueError("Failed to fetch game data.")

def get_linescore_text(game_id):
    textData = statsapi.linescore(game_id)
    if textData:
        return textData
    else:
        raise ValueError("Failed to fetch game data.")
    
def extract_linescore(data):
    """
    Extract the inning-by-inning linescore from the game data, formatted for UI rendering.
    """
    if not data or "liveData" not in data or "linescore" not in data["liveData"]:
        raise ValueError("Linescore data not found in game data.")

    linescore = data["liveData"]["linescore"]
    innings = linescore.get("innings", [])
    home_team = linescore.get("teams", {}).get("home", {})
    away_team = linescore.get("teams", {}).get("away", {})

    logger = logging.getLogger(__name__)
    logger.info("Home Team")
    logger.info(home_team)
    logger.info("Away Team")
    logger.info(away_team)


    # Prepare the scoreboard structure
    result = {
        "home_team": linescore["defense"]["team"]["id"],
        "away_team": linescore["offense"]["team"]["id"],    
        "scoreboard": {
            "innings": [
                {
                    "inning": inning.get("num"),
                    "home": {
                        "runs": inning.get("home", 0),
                        "hits": inning.get("hits", {}).get("home", 0),
                        "errors": inning.get("errors", {}).get("home", 0)
                    },
                    "away": {
                        "runs": inning.get("away", 0),
                        "hits": inning.get("hits", {}).get("away", 0),
                        "errors": inning.get("errors", {}).get("away", 0)
                    }
                }
                for inning in innings
            ],
            "totals": {
                "home": {
                    "runs": home_team.get("runs", 0),
                    "hits": home_team.get("hits", 0),
                    "errors": home_team.get("errors", 0)
                },
                "away": {
                    "runs": away_team.get("runs", 0),
                    "hits": away_team.get("hits", 0),
                    "errors": away_team.get("errors", 0)
                }
            }
        }
    }

    return result


def uicomponentProcessor(uicomponent):
    try:
        if uicomponent["type"] == "LineBox":
            return {
                "type": "LineBox",
                "data": {
                    "gameId": uicomponent["gameId"],
                    "currentInning": uicomponent["currentInning"],
                    "score": get_linescore(uicomponent["gameId"])
                }
            }
        elif uicomponent["type"] == "PlayerCard":
            return {
                "type": "PlayerCard",
                "data": {
                    "playerId": uicomponent["playerId"],
                    "data": get_player_card_data(uicomponent["playerId"]), 
                    "playerMatchSummary" : uicomponent["playerMatchSummary"]
                }
            }
        elif uicomponent["type"] == "GameInfoCard":
            homeTeamId = uicomponent["homeTeamId"]
            awayTeamId = uicomponent["awayTeamId"]
            gameInfo = get_game_info(uicomponent["gameId"])
            return {
                "type": "GameInfoCard",
                "gameId": uicomponent["gameId"],
                "data":{
                    "gameId":uicomponent["gameId"],
                    "location": gameInfo["venue"],
                    "dateAndTime": gameInfo["date_time"],
                    "homeTeamName": gameInfo["home_team"],
                    "awayTeamName": gameInfo["away_team"],
                    "homeTeamLogoURL": get_team_logo_url(homeTeamId),
                    "awayTeamLogoURL": get_team_logo_url(awayTeamId)
                }
            }
        elif uicomponent["type"] == "HighlightVideo":
            vidIndex = uicomponent["index"]
            vidObj = get_game_video_at_index(uicomponent["gameId"], vidIndex)

            vidHeadline = vidObj["headline"] if "headline" in vidObj else "Not Available"
            vidTitle = vidObj["title"] if "title" in vidObj else "Not Available"
            vidDescription = vidObj["description"] if "description" in vidObj else "Not Available"
            
            url = None
            for pb in vidObj["playbacks"]:
                if pb["name"] == "mp4Avc":
                    url = pb["url"]
                    break
            if not url:
                raise ValueError("No video URL found.")
            
            return {
                "type": "HighlightVideo",
                "data":{
                    "gameId":uicomponent["gameId"],
                    "title": vidTitle,
                    "description":"Description : " +  vidDescription + " , HeadLine : " + vidHeadline,
                    "url": url,
                    
                }
                
            }
        elif uicomponent["type"] == "TeamLeaders":
            return {
                "type": "TeamLeaders",
                "data":{
                    "teamId" : uicomponent["teamId"],
                    "season": uicomponent["season"],
                    "teamDetails": getTeamDetails(uicomponent["teamId"]),
                    "champs": get_team_leaders(uicomponent["teamId"], uicomponent["season"],uicomponent["gameType"])
                }
            }
        else:
            raise ValueError("Invalid UI Component type.")
    except ValueError as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error processing UI component: {e}")
        logger.error(f"UI Component: {uicomponent}")
        raise ValueError(f"Error processing UI component: {e}")




# get_full_llm_feed(634594, ["Aaron Judge", "Giancarlo Stanton"], ["Home Runs", "Strikeouts"], ["New York Yankees"])
# game_pk = 634594  # Replace with the actual game ID
# data = fetch_game_data(game_pk)

# if data:
#     linescore = extract_linescore(data)
#     print(json.dumps(linescore, indent=4))
# else:
#     print("Failed to fetch game data.")


