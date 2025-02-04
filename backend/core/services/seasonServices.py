# import statsapi 


# def get_game_ids_in_season(season):
#     """
#     Get all games in a specific season.
#     """
#     year_start = f"{season}-01-01"
#     year_end = f"{season}-12-31"
#     schedule = statsapi.schedule(start_date=year_start, end_date=year_end)
#     game_ids =  [game['game_id'] for game in schedule]
#     return game_ids



# x = get_game_ids_in_season(2023)
# for id in  x: 
#     print(id)
#     print(statsapi.boxscore_data(id).keys())
#     print(statsapi.boxscore_data(id)["summary"])


import requests
import statsapi


def get_game_ids_in_season(season):
    """
    Get all game IDs in a specific season using the MLB Stats API directly.
    """
    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&season={season}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        schedule_dates = response.json().get("dates", [])

        # Extract game IDs from the schedule
        game_ids = [game["gamePk"] for date in schedule_dates for game in date["games"]]

        return game_ids

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for season {season}: {e}")
        return []


# Main logic to process game IDs
if __name__ == "__main__":
    season = 2023
    game_ids = get_game_ids_in_season(season)

    for game_id in game_ids:
        print(game_id)
        try:
            boxscore_data = statsapi.boxscore_data(game_id)
            print(boxscore_data.keys())
            print(boxscore_data["summary"])
        except Exception as e:
            print(f"Error fetching boxscore for game {game_id}: {e}")
