from fastapi import APIRouter, HTTPException, Query
from typing import List
from pydantic import BaseModel
import random
from core.services.languageService import getAllLanguages
router = APIRouter()
import json




@router.get("/getSupportedLanguages")
def getSupportedLanguages():
    """
    Get the list of supported languages.
    """
    return getAllLanguages()

