import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Transcript, AnalysisResult, ActionItem
from dotenv import load_dotenv
from pydantic import BaseModel
import json
import re

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS Middleware to allow Electron frontend to talk to FastAPI directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure APIs
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    print("WARNING: GEMINI_API_KEY not found in environment.")

try:
    deepgram_key = os.environ["DEEPGRAM_API_KEY"]
except KeyError:
    print("WARNING: DEEPGRAM_API_KEY not found in environment. It must be provided or streaming will fail.")
    deepgram_key = ""

# Initialize the Gemini model (Switching to gemini-flash-latest based on supported list)
model = genai.GenerativeModel('gemini-flash-latest')

class TextRequest(BaseModel):
    text: str

def analyze_transcript(transcript_text: str):
    prompt = f"""
    You are an expert AI assistant specializing in meeting analysis. Your task is to process a meeting transcript and extract critical information.
    The meeting took place today.

    Your instructions are:
    1. Generate a brief, executive-level summary.
    2. Extract all specific action items with 'task', 'owner', and 'deadline' (YYYY-MM-DD).

    Provide your final output in a single JSON object with keys: "summary" and "action_items".
    
    Transcript:
    {transcript_text}
    """
    
    response = model.generate_content(prompt)
    
    # Try to extract JSON from markdown code block
    match = re.search(r"```json\s*(.*?)\s*```", response.text, re.DOTALL)
    if match:
        json_string = match.group(1)
    else:
        # Fallback to direct text if no markdown block
        json_string = response.text
    
    try:
        result = json.loads(json_string)
    except Exception:
        # Try to strip any extra text before/after the JSON object
        clean_json_match = re.search(r"(\{.*\})", json_string, re.DOTALL)
        if clean_json_match:
            try:
                result = json.loads(clean_json_match.group(1))
            except Exception:
                raise Exception("Could not parse AI response as JSON even after Regex cleanup")
        else:
            raise Exception("Could not parse AI response as JSON")
            
    result['transcript'] = transcript_text
    return result

@app.get("/api/credentials")
async def get_credentials():
    """Provides the Deepgram API key securely to the local frontend."""
    if not deepgram_key:
        raise HTTPException(status_code=404, detail="DEEPGRAM_API_KEY not set on server.")
    return {"deepgram_api_key": deepgram_key}

@app.post("/analyze/text", response_model=AnalysisResult)
async def analyze_text(request: TextRequest):
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Transcript text cannot be empty.")
            
        result = analyze_transcript(request.text)
        return AnalysisResult(**result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
