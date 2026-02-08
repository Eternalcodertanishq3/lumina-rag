from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from pathlib import Path
from dotenv import load_dotenv
from backend.rag_pipeline import ingest_document, answer_query_rag
from backend.file_processor import process_file
from backend.auth import get_current_user
from backend.chat_history import (
    create_chat, get_user_chats, get_chat_messages, save_message, delete_chat
)
from backend.models import Chat, Message, ChatCreate

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Predusk RAG API", version="1.0.0")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://predusk-rag.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class ChatRequest(BaseModel):
    query: str
    chat_id: str | None = None

@app.get("/")
async def root():
    return {"message": "Predusk RAG API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/ingest")
async def ingest_route(
    file: UploadFile = File(None),
    text: str = Form(None),
    source: str = Form(...),
    user: dict = Depends(get_current_user)
):
    try:
        content = ""
        # user is now a dict {"id": "...", "token": "..."}
        user_id = user["id"]
        token = user["token"]

        if file:
            content = await process_file(file)
            # Use filename as source if not provided, or append
            if not source or source == "undefined":
                 source = file.filename
        elif text:
            content = text
        else:
            raise HTTPException(status_code=400, detail="Either 'file' or 'text' must be provided")

        count = ingest_document(content, source, user_id, token)
        return {"message": "Ingestion successful", "chunks_count": count}
    except Exception as e:
        print(f"Error in /ingest: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_route(request: ChatRequest, user: dict = Depends(get_current_user)):
    try:
        user_id = user["id"]
        token = user["token"]

        # 1. Handle Chat Session
        chat_id = request.chat_id
        if not chat_id:
             # Create new chat if not provided
             # Generate title from query (simplify for now)
             title = request.query[:50] + "..."
             new_chat = create_chat(user_id, token, title)
             chat_id = str(new_chat['id'])

        # 2. Save User Message
        save_message(chat_id, "user", request.query, user_id, token)

        # 3. Generate Answer
        response = answer_query_rag(request.query, user_id, token)
        
        # 4. Save Assistant Message
        save_message(chat_id, "assistant", response["answer"], user_id, token)

        # 5. Return Response with Chat ID
        response["chat_id"] = chat_id
        return response
    except Exception as e:
        print(f"Error in /chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- Chat History Endpoints ---

@app.get("/chats")
async def get_chats_route(user: dict = Depends(get_current_user)):
    return get_user_chats(user["id"], user["token"])

@app.post("/chats")
async def create_chat_route(chat: ChatCreate, user: dict = Depends(get_current_user)):
    return create_chat(user["id"], user["token"], chat.title)

@app.get("/chats/{chat_id}/messages")
async def get_messages_route(chat_id: str, user: dict = Depends(get_current_user)):
    return get_chat_messages(chat_id, user["id"], user["token"])

@app.delete("/chats/{chat_id}")
async def delete_chat_route(chat_id: str, user: dict = Depends(get_current_user)):
    delete_chat(chat_id, user["id"], user["token"])
    return {"message": "Chat deleted"}

# --- Scraper Endpoint ---
from backend.scraper import scrape_url

@app.post("/ingest/url")
async def ingest_url_route(
    url: str = Form(...),
    user: dict = Depends(get_current_user)
):
    try:
        content = scrape_url(url)
        count = ingest_document(content, url, user["id"], user["token"])
        return {"message": "URL ingested successfully", "chunks_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
