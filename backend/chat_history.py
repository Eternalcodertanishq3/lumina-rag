from typing import List, Optional
from uuid import UUID
from backend.supabase_client import get_scoped_client
from backend.models import Chat, Message

def get_user_chats(user_id: str, token: str) -> List[Chat]:
    supabase = get_scoped_client(token)
    response = supabase.table("chats") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()
    return response.data

def create_chat(user_id: str, token: str, title: str = "New Chat") -> Chat:
    supabase = get_scoped_client(token)
    response = supabase.table("chats") \
        .insert({"user_id": user_id, "title": title}) \
        .execute()
    return response.data[0]

def get_chat_messages(chat_id: str, user_id: str, token: str) -> List[Message]:
    supabase = get_scoped_client(token)
    response = supabase.table("messages") \
        .select("*") \
        .eq("chat_id", chat_id) \
        .order("created_at", desc=False) \
        .execute()
    return response.data

def save_message(chat_id: str, role: str, content: str, user_id: str, token: str) -> Message:
    supabase = get_scoped_client(token)
    response = supabase.table("messages") \
        .insert({
            "chat_id": chat_id, 
            "role": role, 
            "content": content
        }) \
        .execute()
    return response.data[0]

def delete_chat(chat_id: str, user_id: str, token: str):
    supabase = get_scoped_client(token)
    supabase.table("chats").delete().eq("id", chat_id).execute()
