from fastapi import APIRouter, Query
from typing import List
from core.services.mainServices import get_game_commentary

router = APIRouter()
import json
@router.get("/game-rewind")
def get_game_rewind(
    game_id: str,
    music_url: str,
    language: str,
    focus_players: List[str] = Query(default=[]),
    focus_areas: List[str] = Query(default=[]),
    focus_teams: List[str] = Query(default=[]),

):
    """
    Get a game rewind commentary.
    """

    # return the file called clientData.json in the same directory for testing
    
    # with open("clientData.json", "r") as file:
    #     return json.load(file)
    



    return get_game_commentary(game_id, focus_players, focus_areas, focus_teams, music_url, language)


@router.get("/getFocusAreas")
def get_focus_areas():
    """
    Get all focus areas.
    """
    focus_areas = [
        "Homeruns",
        "Walk-Off Wins",
        "Strikeout Leaders",
        "Top Defensive Plays",
        "Grand Slams",
        "Stolen Bases",
        "Biggest Comebacks"
    ]
    data = {
        "focus_areas": focus_areas
    }

    #mlb game metrics and focus areas
    return data