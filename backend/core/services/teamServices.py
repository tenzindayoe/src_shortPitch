import statsapi

from typing import List
import requests
import logging
# Get Team Data


def get_all_teams():
    """
    Get all teams.
    """
    teams = statsapi.get('teams', {'sportId': 1})  # sportId 1 refers to MLB

    # Extract team names and IDs
    team_list = [(team['id'], team['name']) for team in teams['teams']]
    logging.info(f"Found {len(team_list)} teams.")
    logging.info("Teams: %s", team_list)
    return team_list

def get_all_teams_detailed():
    teams = get_all_teams()

    detailed_teams = []
    for team_id, team_name in teams:
        team_data = getTeamDetails(team_id)
        detailed_teams.append(team_data)
    
    return detailed_teams

def get_all_teams_display_data():   
    teams = get_all_teams()

    detailed_teams = []
    for team_id, team_name in teams:
        team_data = getTeamDisplayData(team_id, team_name)
        detailed_teams.append(team_data)
    
    return detailed_teams



def getTeamDetails(team_id):
    team_data = {}
    team_data['id'] = team_id
    team_data['name'] = statsapi.lookup_team(team_id)[0]['name']
    team_data['logo'] = get_team_logo_url(team_id)
    #team_data['full_data'] = get_latest_full_team_data_with_id(team_id)
    #team_data['roster'] = get_latest_team_roster_with_id(team_id)
    return team_data

def getTeamDisplayData(team_id, name):    
    team_data = {}
    team_data['id'] = team_id
    team_data['name'] = name
    team_data['logo'] = get_team_logo_url(team_id)
    return team_data

def get_all_mlb_team_names() -> List[str]:
    """Fetches and returns a list of all MLB team names."""
    teams_url = "https://statsapi.mlb.com/api/v1/teams"
    response = requests.get(teams_url, params={"sportId": 1})  # sportId=1 ensures only MLB teams

    if response.status_code == 200:
        teams = response.json().get("teams", [])
        return [team["name"] for team in teams]  # Extracting only MLB team names
    
    return []  # Return an empty list if the request fails


def get_team_id_with_name(team_name):
    """
    Get the team ID using the team name.
    """
    team = statsapi.lookup_team(team_name)
    if team:
        return team[0]['id']
    else:
        raise ValueError(f"Team '{team_name}' not found.")

def get_latest_full_team_data_with_id(team_id):
    """
    Get the latest full team data using the team ID.
    """
    team = statsapi.lookup_team(team_id)
    return team

def get_team_logo_url(team_id):
    return f"https://www.mlbstatic.com/team-logos/team-cap-on-dark/{team_id}.svg"

def get_latest_team_game_id(team_id):
    """
    Get the latest game ID for a specific team.
    """
    return statsapi.last_game(team=team_id)

def get_latest_team_roster_with_id(team_id):
    """
    Get the latest team roster using the team ID.
    """
    roster = statsapi.roster(team_id)
    return roster

def get_games_with_team_id_and_start_date(team_id,start_date):
    """
    Get game data for a specific team on a specific date.
    """
    schedule = statsapi.schedule(team=team_id, start_date=start_date)
    if schedule:
        return schedule  # Return the first game found for the date
    else:
        raise ValueError(f"No games found for team ID {team_id} on {start_date}.")

def get_game_team_roster_with_team_id(team_id, game_id):
    """
    Get the team roster for a specific game using the team ID and game ID.
    """
    #print(statsapi.boxscore_data(game_id).keys())
    #print(statsapi.boxscore_data(game_id)["teamInfo"])
    boxscore_data = statsapi.boxscore_data(game_id)
    

    away_team_id = statsapi.boxscore_data(game_id)["away"]['team']["id"]
    home_team_id = statsapi.boxscore_data(game_id)["home"]['team']["id"]
    
    if team_id == away_team_id:
        return statsapi.boxscore_data(game_id)["away"]["players"]
    elif team_id == home_team_id:
        return statsapi.boxscore_data(game_id)["home"]["players"]    
    else:
        raise ValueError(f"Team ID {team_id} not found in game ID {game_id}.")



def get_all_roster_ids(team_id, game_id):
    """
    Get all roster IDs for a specific team in a specific game.
    """
    player = get_game_team_roster_with_team_id(team_id, game_id)
    playerIds = []
    for playerKey, playerValue in player.items():
        playerIds.append(playerValue['person']['id'])
    return playerIds

def get_all_roster_names(team_id, game_id):
    """
    Get all roster names for a specific team in a specific game.
    """
    player = get_game_team_roster_with_team_id(team_id, game_id)
    playerNames = []
    for playerKey, playerValue in player.items():
        playerNames.append(playerValue['person']['fullName'])
    
    return playerNames
    
# Example Usage
# try:
#     team_name = 'Yankees'
#     game_date = '2023-09-15'

#     # Get team ID
#     team_id = get_team_id_with_name(team_name)
#     print(f"Team ID for {team_name}: {team_id}")

#     # Get game data
#     game_data = get_games_with_team_id_and_start_date(team_id, game_date)
#     print(game_data[0].keys())
#     game_id = game_data[0]['game_id']

#     # Get game roster for the team
#     roster_data = get_game_team_roster_with_team_id(team_id, game_id)
#     print(roster_data)

#     # Get all roster names
#     roster_names = get_all_roster_names(team_id, game_id)
#     print(roster_names)


# except ValueError as e:
#     print(e)




def get_team_leaders(team_id, season, gameType):
    """
    Get the team leaders for the specified team and season.
    """
    leader_categories = ['onBasePlusSlugging', 'earnedRunAverage', 'fieldingPercentage']
    team_leaders = {}

    for category in leader_categories:
        leaders = statsapi.get('team_leaders',
        {
            'teamId': team_id,
            'leaderCategories': category,
            'season': season,
            'leaderGameTypes': gameType,
            'limit': 3
        })
        team_leaders[category] = leaders  # This returns a list of lists

    return team_leaders


def textify_team_leaders(team_id, season, gameType):
    """
    Convert the team leaders data into a text format.
    """
    team_id = int(team_id)
    season = int(season)

    team_leaders = get_team_leaders(team_id, season, gameType)
    
    text = f"For team ID {team_id} in season {season} ({gameType}):\n\n"

    for category, data in team_leaders.items():
        text += f"{category.replace('_', ' ').title()} Leaders:\n"

        for entry in data["teamLeaders"]:
            category_name = entry["leaderCategory"]
            text += f"Category: {category_name.replace('Plus', '+')}\n"

            for leader in entry["leaders"]:
                rank = leader["rank"]
                player_name = leader["person"]["fullName"]
                stat_value = leader["value"]
                text += f"{rank}. {player_name} ({stat_value})\n"

            text += "\n"
    
    return text


