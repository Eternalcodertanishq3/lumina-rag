from supabase import create_client, Client, ClientOptions
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Supabase credentials not found in env variables")

supabase: Client = create_client(url, key)

def get_supabase_client():
    return supabase

def get_scoped_client(token: str) -> Client:
    """Create a Supabase client scoped to the user's token for RLS."""
    # Pass the user's JWT in the Authorization header via ClientOptions
    options = ClientOptions().replace(headers={'Authorization': f'Bearer {token}'})
    return create_client(url, key, options=options)
