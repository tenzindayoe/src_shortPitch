from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.services.gcloudServices import getLatestComments, addNewComment

router = APIRouter()

# Define request schema for POST request
class CommentRequest(BaseModel):
    game_id: str
    username: str
    comment: str

@router.get("/comments")
def get_comments(game_id: str, count: int = 5):
    """
    Get the latest comments for a game.
    """
    try:
        return getLatestComments(count, game_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/comments")
def add_comment(comment_data: CommentRequest):
    """
    Add a new comment to a game.
    """
    try:
        return addNewComment(comment_data.comment, comment_data.game_id, comment_data.username)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
