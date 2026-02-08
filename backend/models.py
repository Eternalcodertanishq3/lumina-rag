from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class Message(BaseModel):
    id: UUID
    chat_id: UUID
    role: str
    content: str
    created_at: datetime

class Chat(BaseModel):
    id: UUID
    user_id: UUID
    title: Optional[str] = None
    created_at: datetime

class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class MessageCreate(BaseModel):
    role: str
    content: str

class ChatHistoryResponse(BaseModel):
    chats: List[Chat]

class ChatMessagesResponse(BaseModel):
    messages: List[Message]
