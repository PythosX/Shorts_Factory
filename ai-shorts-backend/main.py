from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os
from dotenv import load_dotenv
from google import genai

# Read local environment files safely
load_dotenv()

# Initialize Gemini SDK Client natively
# Automatically checks for the GEMINI_API_KEY environment value
client = genai.Client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    youtube_url: str

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.get("/")
def home():
    return {"status": "online", "message": "AI Shorts Engine Active."}

@app.post("/api/download")
async def download_video(request: VideoRequest):
    url = request.youtube_url
    if not url:
        raise HTTPException(status_code=400, detail="No YouTube URL provided")
        
    try:
                # Download rules for yt-dlp 
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
            'outtmpl': f'{DOWNLOAD_DIR}/%(id)s.%(ext)s',
            'cookiefile': 'cookies.txt', # 👈 ADD THIS LINE HERE
        }

        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_id = info.get("id")
            video_title = info.get("title")
            
        # Hook Gemini Engine to formulate an introductory click title to test validation!
        ai_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Generate a captivating 1-line title for an engaging Short based on this original video name: {video_title}",
        )
        
        return {
            "status": "success",
            "video_id": video_id,
            "title": video_title,
            "ai_suggested_hook": ai_response.text.strip()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
  
