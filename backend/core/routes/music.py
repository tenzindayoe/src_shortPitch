from fastapi import APIRouter, HTTPException, Query
from typing import List
from pydantic import BaseModel
import random

router = APIRouter()
import json


music_sources = {
    "musics": [
        {
            "name": "Music1",
            "url": "https://storage.googleapis.com/wrappedmusic/brick-by-brick-trending-advertising-279931.mp3"
        },
        {
            "name": "Music2",
            "url" : "https://storage.googleapis.com/wrappedmusic/creative-technology-showreel-241274.mp3"
        },
        {
            "name": "Music3",
            "url":"https://storage.googleapis.com/wrappedmusic/prism-of-darkness-funny-hip-hop-background-music-for-video-39-second-291296.mp3"
        }

    ]
    
}


@router.get("/getRandomMusic")
def get_random_music():
    """
    Get a random music track.
    """
    randomIndex = random.randint(0, len(music_sources["musics"]) - 1)
    return music_sources["musics"][randomIndex]


    
