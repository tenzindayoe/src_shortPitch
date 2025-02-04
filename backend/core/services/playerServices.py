import statsapi 
import json

def get_player_id_with_name_and_team(player_name, team_name):
    """
    Get the player ID using the player name.
    """
    player = statsapi.lookup_player(player_name, team=team_name)
    if player:
        return player[0]['id']
    else:
        raise ValueError(f"Player '{player_name}' not found for team '{team_name}'.")

def get_player_overall_stats(player_id):
    """
    Get the player overall stats using the player ID.
    """
    player_stats = statsapi.player_stat_data(
        player_id, group="[hitting,pitching,fielding]", type='career', sportId=1
    )
   
    if not player_stats or 'stats' not in player_stats:
        return {"error": "No stats found for this player"}

    overall_stats = {}

    for stat_group in player_stats.get("stats", []):
        group_name = stat_group.get("group")
        stats_data = stat_group.get("stats", {})

        if group_name == "hitting" and stats_data:
            overall_stats["Hitting"] = {
                "AVG": stats_data.get("avg", "N/A"),
                "HR": stats_data.get("homeRuns", "N/A"),
                "RBI": stats_data.get("rbi", "N/A"),
                "OPS": stats_data.get("ops", "N/A"),
                "Games Played": stats_data.get("gamesPlayed", "N/A"),
            }

        elif group_name == "pitching" and stats_data:
            overall_stats["Pitching"] = {
                "ERA": stats_data.get("era", "N/A"),
                "Strikeouts": stats_data.get("strikeOuts", "N/A"),
                "WHIP": stats_data.get("whip", "N/A"),
                "Wins": stats_data.get("wins", "N/A"),
                "Losses": stats_data.get("losses", "N/A"),
            }

        elif group_name == "fielding" and stats_data:
            # Ignore fielding if the player has 0 putouts, assists, and errors
            if any([
                stats_data.get("putOuts", 0) > 0,
                stats_data.get("assists", 0) > 0,
                stats_data.get("errors", 0) > 0,
            ]):
                overall_stats["Fielding"] = {
                    "Putouts": stats_data.get("putOuts", "N/A"),
                    "Assists": stats_data.get("assists", "N/A"),
                    "Errors": stats_data.get("errors", "N/A"),
                    "Fielding Percentage": stats_data.get("fielding", "N/A"),
                }

    return overall_stats

def get_player_card_data(player_id):
    """
    Get the player's profile information, stats, and additional details.
    """
    player_data = statsapi.get('person', {'personId': player_id})
    if "people" not in player_data:
        return {"error": "Player not found"}

    person = player_data["people"][0]
    stats = get_player_overall_stats(player_id)
    
    player_card = {
        "id": person.get("id"),
        "name": person.get("fullName"),
        "nickname": person.get("nickName"),
        "position": person.get("primaryPosition", {}).get("abbreviation"),
        "jersey_number": person.get("primaryNumber"),
        "birth_date": person.get("birthDate"),
        "age": person.get("currentAge"),
        "birth_city": person.get("birthCity"),
        "birth_state": person.get("birthStateProvince"),
        "birth_country": person.get("birthCountry"),
        "height": person.get("height"),
        "weight": person.get("weight"),
        "bats": person.get("batSide", {}).get("description"),
        "throws": person.get("pitchHand", {}).get("description"),
        "mlb_debut": person.get("mlbDebutDate"),
        "years_in_mlb": None if not person.get("mlbDebutDate") else 2025 - int(person.get("mlbDebutDate")[:4]),
        "draft_year": person.get("draftYear"),
        "headshot_url": f"https://img.mlbstatic.com/mlb/images/players/head_shot/{player_id}.jpg",
        "mlb_profile_url": f"https://www.mlb.com/player/{player_id}",
        "overall_stats": stats
    }
    
    return player_card

# Example Usage:
# print(get_player_card_data(545361))  # Mike Trout's player ID
# print(get_player_card_data(660271))  # Aaron Judge's player ID

