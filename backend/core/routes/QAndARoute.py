from fastapi import APIRouter, HTTPException, Query
from typing import List
from core.services.llmQAndAService import qandAService
from pydantic import BaseModel


router = APIRouter()
import json

class QandARequest(BaseModel):
    session_id: str
    game_id: str
    query: str

@router.post("/AIChat", response_model=dict)
async def get_qc_and_a(request: QandARequest):
    """
    Endpoint to process a Q&A request using the Gemini model and update Firestore session history.
    The request JSON should include session_id, game_id, and query.
    """
    try:
        # Call your service function
        result_json = qandAService(request.session_id, request.game_id, request.query)
        # Convert the JSON string into a Python dict
        result_data = json.loads(result_json)
        return result_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))