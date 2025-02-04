
from fastapi import APIRouter, HTTPException, Query
from typing import List
from core.services.teamServices import get_all_teams, get_all_teams_detailed, getTeamDetails, get_all_teams_display_data, get_game_team_roster_with_team_id
from pydantic import BaseModel
import logging

router = APIRouter()
import json



#sends name and team id only for each team
@router.get("/getAllTeamNamesAndIds")
def get_teams():
    """
    Get all teams.
    """
    try:
        return get_all_teams()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#sends all the information about the team for each team
@router.get("/getAllTeamsDetailed")
def get_teams_detailed():
    """
    Get all teams with detailed information.
    """
    try:
        return get_all_teams_detailed()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/getTeamsDisplayData")
def get_teams_display_data():
    """
    Get all teams with display data.
    """
    try:
        return get_all_teams_display_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


#sends all the information about the team for a specific team
@router.get("/getTeamDetails")
def get_team_details(team_id: str):
    """
    Get team details.
    """
    try:
        return getTeamDetails(team_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/getGameTeamDetails")
def get_game_team_details_route(game_id: str, team_id: str):
    """
    Get team details.
    """

    try:
        teamInfo = getTeamDetails(team_id)
        roster_raw = get_game_team_roster_with_team_id(team_id=int(team_id), game_id=str(game_id))
        roster = []
       
        for key, value in roster_raw.items():
            player ={}
            player["id"] = value["person"]["id"]
            player["name"] = value["person"]["fullName"]
            player["snapshot"] = f"https://securea.mlb.com/mlb/images/players/head_shot/{player['id']}.jpg"
            roster.append(player)
        teamInfo["roster"] = roster
        return teamInfo
    
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching team details for team {team_id} in game {game_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
