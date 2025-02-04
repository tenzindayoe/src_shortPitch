import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from core.services.teamServices import get_all_mlb_team_names, get_team_logo_url
from core.services.gameServices import get_game_teams_ids



MLB_API_BASE_URL = "https://statsapi.mlb.com/api/v1/schedule"

class GameSearchParams(BaseModel):
    start_date: Optional[str] = Field(None, description="Start date for game search in YYYY-MM-DD format")
    end_date: Optional[str] = Field(None, description="End date for game search in YYYY-MM-DD format")
    team1: Optional[str] = Field(None, description="First team name")
    team2: Optional[str] = Field(None, description="Second team name")

router = APIRouter()



@router.get("/getAllTeamNames")
def get_all_team_names():
    """
    Get all MLB team names.
    """
    
    return get_all_mlb_team_names()



@router.get("/getGameTeams")
def get_game_teams(game_id: str):
    """
    Get the teams playing in a specific game.
    """
    return get_game_teams_ids(game_id)


def get_team_id(team_name: str) -> Optional[int]:
    """Fetches the team ID using the team name from the MLB API."""
    teams_url = "https://statsapi.mlb.com/api/v1/teams"
    response = requests.get(teams_url)

    if response.status_code == 200:
        teams = response.json().get("teams", [])

        # 🔥 Try exact match first
        for team in teams:
            if team_name.lower() == team["name"].lower():
                return team["id"]

        # 🔥 Try partial match (if Yankees is really "New York Yankees")
        for team in teams:
            if team_name.lower() in team["name"].lower():
                return team["id"]

    return None  # Team not found

@router.post("/findGames")
async def find_games(params: GameSearchParams):
   
    """
    Fetch games based on search parameters.
    
    - No team: Returns **all games** (up to 100).
    - Only team1: Returns **all games** where `team1` played (up to 100).
    - Both teams: Returns **games where `team1` and `team2` played against each other** (up to 100).
    - No date provided: Fetches **latest 100 games**.
    """


    if not params.start_date and params.end_date:
        # from beinnnig of the year
        year = params.end_date.split("-")[0]
        params.start_date = f"{year}-01-01"
    
    if params.start_date and not params.end_date:
        # check if today is greater than the end of the year 
        year = params.start_date.split("-")[0]
        today = datetime.today()
        if today.year > int(year):
            params.end_date = f"{year}-12-31"
        else:
            params.end_date = today.strftime("%Y-%m-%d")
    

    # Get the current date if no date is provided
    if not params.start_date and not params.end_date:
        year = datetime.now().year
        params.start_date = f"{year}-01-01"
        params.end_date = datetime.now().strftime("%Y-%m-%d")
    
    
    
    # Convert team names to team IDs
    team1_id = get_team_id(params.team1) if params.team1 else None
    team2_id = get_team_id(params.team2) if params.team2 else None

    if params.team1 and not team1_id:
        return {"status": "error", "message": f"Team '{params.team1}' not found"}
    
    if params.team2 and not team2_id:
        return {"status": "error", "message": f"Team '{params.team2}' not found"}

    # Fetch game schedule from MLB API
    query_params = {
        "sportId": 1,  # MLB
        "startDate": params.start_date,
        "endDate": params.end_date,
    }
    
    response = requests.get(MLB_API_BASE_URL, params=query_params)
    
    if response.status_code != 200:
        return {"status": "error", "message": "Failed to fetch data from MLB API"}

    data = response.json()
    games_found = []

    # Extract and filter games
    for date in data.get("dates", []):
        for game in date.get("games", []):
            game_teams = {game["teams"]["away"]["team"]["id"], game["teams"]["home"]["team"]["id"]}
            
            # If no teams are provided, return all games
            if not team1_id and not team2_id:
                games_found.append({
                    "game_id": game["gamePk"],
                    "date": game["officialDate"],
                    "home_team": game["teams"]["home"]["team"]["name"],
                    "away_team": game["teams"]["away"]["team"]["name"],
                    "home_team_logo": get_team_logo_url(game["teams"]["home"]["team"]["id"]),
                    "away_team_logo": get_team_logo_url(game["teams"]["away"]["team"]["id"]),
                })
            
            # If only team1 is provided, find all games where team1 participated
            elif team1_id and not team2_id:
                if team1_id in game_teams:
                    games_found.append({
                        "game_id": game["gamePk"],
                        "date": game["officialDate"],
                        "home_team": game["teams"]["home"]["team"]["name"],
                        "away_team": game["teams"]["away"]["team"]["name"],
                        "home_team_logo": get_team_logo_url(game["teams"]["home"]["team"]["id"]),
                        "away_team_logo": get_team_logo_url(game["teams"]["away"]["team"]["id"]),
                    })
            
            # If both team1 and team2 are provided, find games between them
            elif team1_id and team2_id:
                if {team1_id, team2_id} == game_teams:
                    games_found.append({
                        "game_id": game["gamePk"],
                        "date": game["officialDate"],
                        "home_team": game["teams"]["home"]["team"]["name"],
                        "away_team": game["teams"]["away"]["team"]["name"],
                        "home_team_logo": get_team_logo_url(game["teams"]["home"]["team"]["id"]),
                        "away_team_logo": get_team_logo_url(game["teams"]["away"]["team"]["id"]),
                    })

    # Restrict results to 100 games
    games_found = games_found[:100]


    return {"status": "success", "games": games_found}



def getMostRecentGames(teamId: Optional[int], count: int) -> List[dict]:
    """
    Retrieve the most recent games.
    
    - If teamId is None, then return any most recent games.
    - If teamId is provided, return the most recent games where the team was involved (as home or away).
    
    The function will start from the current year and work backwards year by year
    until it accumulates at least 'count' games or until the cutoff year is reached.
    
    Returns:
        A list of game dictionaries with keys:
          - game_id
          - date
          - home_team
          - away_team
          - home_team_logo
          - away_team_logo
    """
    from datetime import datetime
    import requests

    games_found = []
    current_year = datetime.now().year
    today = datetime.now().date()

    # Set a cutoff year to avoid infinite loops (adjust as needed)
    cutoff_year = 1900
    year = current_year

    while len(games_found) < count and year >= cutoff_year:
        # For the current year, we only want games up to today.
        if year == current_year:
            start_date = f"{year}-01-01"
            end_date = today.strftime("%Y-%m-%d")
        else:
            start_date = f"{year}-01-01"
            end_date = f"{year}-12-31"

        query_params = {
            "sportId": 1,  # MLB
            "startDate": start_date,
            "endDate": end_date,
        }
        # You might try passing the teamId directly if the MLB API supports it:
        # if teamId is not None:
        #     query_params["teamId"] = teamId

        response = requests.get(MLB_API_BASE_URL, params=query_params)
        if response.status_code != 200:
            print(f"Failed to fetch data for year {year}. Skipping.")
            year -= 1
            continue

        data = response.json()
        temp_games = []

        # The MLB API returns a list of dates. For each date, there is a list of games.
        for date_info in data.get("dates", []):
            for game in date_info.get("games", []):
                # Extract the two team IDs for this game.
                game_team_ids = {
                    game["teams"]["home"]["team"]["id"],
                    game["teams"]["away"]["team"]["id"],
                }

                # If a teamId is provided, only include games where that team participated.
                if teamId is not None and teamId not in game_team_ids:
                    continue

                # Build the game information dictionary.
                game_info = {
                    "game_id": game["gamePk"],
                    "date": game["officialDate"],
                    "home_team": game["teams"]["home"]["team"]["name"],
                    "away_team": game["teams"]["away"]["team"]["name"],
                    "home_team_logo": get_team_logo_url(game["teams"]["home"]["team"]["id"]),
                    "away_team_logo": get_team_logo_url(game["teams"]["away"]["team"]["id"]),
                }

                # Add a helper key for sorting (convert date string to a datetime object)
                try:
                    # If the API provides a full datetime use game["gameDate"]
                    # Otherwise, fallback to officialDate (which is in YYYY-MM-DD format).
                    game_datetime = datetime.fromisoformat(game.get("gameDate", game["officialDate"]))
                except Exception:
                    game_datetime = datetime.strptime(game["officialDate"], "%Y-%m-%d")
                game_info["_game_date"] = game_datetime

                temp_games.append(game_info)

        # Sort the games from this year in descending order by game date.
        temp_games.sort(key=lambda x: x["_game_date"], reverse=True)

        # Determine how many more games are needed.
        needed = count - len(games_found)
        games_found.extend(temp_games[:needed])

        # Move to the previous year.
        year -= 1

    # Finally, sort the overall list (across years) in descending order.
    games_found.sort(key=lambda x: x["_game_date"], reverse=True)

    # Remove the helper key before returning the results.
    for game in games_found:
        game.pop("_game_date", None)

    return games_found


@router.get("/getMostRecentGames")
async def api_get_most_recent_games(teamId: Optional[int] = None, count: int = 10):
    """
    API endpoint to get the most recent games.
    
    - **teamId**: (optional) ID of the team to filter games by.
    - **count**: Number of recent games to return (default is 10).
    
    If teamId is not provided, the API returns recent games from any team.
    """
    try:
        games = getMostRecentGames(teamId, count)
    except Exception as e:
        # Log the error and return an HTTP 500 error.
        print("Error retrieving games:", e)
        raise HTTPException(status_code=500, detail="Internal server error")
    
    return {"status": "success", "games": games}
