from fastapi import FastAPI
import uvicorn
from core.services.voiceGenServices import *
from core.routes.gameRewind import router as game_rewind_router
from core.routes.gameComments import router as game_comments_router
from core.routes.QAndARoute import router as q_and_a_router
from core.routes.teamRoute import router as team_router
from core.routes.gameRoutes import router as game_router
from core.routes.music import router as music_router
from core.routes.language import router as language_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

allowed_origins = [
    "http://shortpitchai.com",
    "https://shortpitchai.com",
    "http://www.shortpitchai.com",
    "https://www.shortpitchai.com"
]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=allowed_origins,  # Only allow requests from shortpitchai.com
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow ALL HTTP methods (GET, POST, PUT, DELETE, etc.)
#     allow_headers=["*"],  # Allow all headers
# )

app.include_router(game_rewind_router)
app.include_router(game_comments_router)
app.include_router(q_and_a_router)
app.include_router(team_router)
app.include_router(game_router)
app.include_router(music_router)
app.include_router(language_router)
@app.get("/")
def read_root():
    return {"message": "Welcome to the Core API!"}

if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=8080)
