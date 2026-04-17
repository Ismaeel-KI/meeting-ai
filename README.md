# MinuteMaster - Meeting AI Assistant

## Overview

The **MinuteMaster** system is an AI-powered desktop application built to streamline meeting documentation. It leverages live transcription and cutting-edge LLMs to record, transcribe, summarize, and extract actionable items from your meetings in real-time.

---

## System Architecture

The application is split into two primary components: an Electron-wrapped Next.js frontend and a stateless FastAPI Python backend.

**High-Level Flow:**
`Audio Capture (Frontend)` → `Direct Deepgram Streaming (Frontend)` → `Raw Transcript Text` → `Core Backend Agent (FastAPI)` → `LLM Analysis (Google Gemini)` → `Structured JSON Output (Summary & Action Items)`

### 1. Frontend Desktop App (Electron & Next.js)
The frontend is built with **Next.js**, **React**, **TailwindCSS**, and **Radix UI**, wrapped into a cross-platform desktop application using **Electron**.
* Requests secure API credentials from the backend.
* Handles system audio capture and real-time streaming directly to **Deepgram** for speech-to-text transcription.
* Displays a modern, responsive UI to show real-time meeting transcripts.
* Sends compiled transcripts to the backend for AI processing once the meeting concludes.
* Prepares data for external integrations (such as exporting to Notion).

### 2. Core Backend Agent (FastAPI)
The backend is a lightweight, stateless Python application utilizing the **FastAPI** framework.
* **Credentials Endpoint (`/api/credentials`)**: Securely provides the Deepgram API key to the frontend so it isn't hardcoded in the client application.
* **AI Analysis Endpoint (`/analyze/text`)**: Takes a complete, raw transcript string and prompts **Google Gemini Flash** to generate an executive summary and extract precise action items (task, owner, deadline).
* *Note: The backend currently operates without a database (no persistent storage) and does not handle real-time streaming directly.*

---

## Technologies Used

* **Frontend:** Next.js (React 18), Electron, Tailwind CSS, Radix UI, Framer Motion
* **Backend:** Python, FastAPI, Uvicorn, Pydantic
* **AI & Machine Learning:** Google Gemini (`gemini-flash-latest`) for analysis, Deepgram for real-time transcription
* **Integrations:** Prepare for exporting to Notion (via `@notionhq/client`)

---

## Agentic LLM Workflow 🤖

MinuteMaster leverages Google Gemini to distill unstructured conversation into focused insights.

**Analysis Process:**
1. **Dynamic Prompting**: The backend automatically fetches the current date to give the LLM context.
2. **One-Shot Extraction**: The backend securely passes the full transcript to Gemini using an expert prompt.
3. **Structured Response**: The LLM outputs strict JSON containing an executive summary and a list of action items, specifying the required `task`, predicted `owner`, and relative `deadline`.

**Expected JSON Output from Backend:**
```json
{
  "summary": "The team synchronized on the Q3 launch status. Key responsibilities for marketing assets and the announcement blog post were assigned.",
  "action_items": [
    {
      "task": "Finalize marketing asset designs for review.",
      "owner": "John",
      "deadline": "2025-07-25"
    }
  ],
  "transcript": "[Full transcript text...]"
}
```

---

## Running Locally

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a Python virtual environment.
3. Install dependencies: `pip install -r requirements.txt`
4. Set up an `.env` file with `GEMINI_API_KEY` and `DEEPGRAM_API_KEY`.
5. Run the server: `uvicorn main:app --reload` (Runs on `http://127.0.0.1:8000`)

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development environment (Next.js + Electron window): `npm run electron-dev`
