import time
import google.generativeai as genai
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Gemini API Key not found")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize models
embedding_model = "models/gemini-embedding-001"
# Use gemini-flash-latest for best stability
generative_model = genai.GenerativeModel('models/gemini-flash-latest', generation_config={"response_mime_type": "text/plain"})

def retry_with_backoff(func, max_retries=5, initial_delay=1):
    """
    Retry decorator with exponential backoff.
    Handles rate limits (429), server errors (5xx), and transient network issues.
    """
    def wrapper(*args, **kwargs):
        retries = 0
        last_exception = None
        
        while retries < max_retries:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_str = str(e).lower()
                last_exception = e
                
                # Retry on rate limits, server errors, or network issues
                should_retry = any(x in error_str for x in [
                    "429", "rate", "quota", "resource_exhausted",
                    "500", "502", "503", "504", "unavailable", 
                    "timeout", "connection", "deadline"
                ])
                
                if should_retry:
                    wait_time = initial_delay * (2 ** retries)
                    print(f"[Retry {retries + 1}/{max_retries}] API error: {e}. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    retries += 1
                else:
                    # Non-retryable error, raise immediately
                    raise e
        
        # All retries exhausted
        raise Exception(f"Max retries ({max_retries}) exceeded. Last error: {last_exception}")
    return wrapper

@retry_with_backoff
def get_embedding(text: str) -> list[float]:
    """Generate embeddings for text using Gemini API."""
    result = genai.embed_content(
        model=embedding_model,
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

@retry_with_backoff
def generate_response(prompt: str) -> str:
    """Generate response using Gemini Flash Lite."""
    response = generative_model.generate_content(prompt)
    return response.text


def get_embeddings_batch(texts: list[str], batch_size: int = 5) -> list[list[float]]:
    """
    Get embeddings for multiple texts with rate limiting.
    Processes in small batches with delays to avoid hitting rate limits.
    """
    embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        
        for text in batch:
            embedding = get_embedding(text)
            embeddings.append(embedding)
        
        # Small delay between batches to avoid rate limits
        if i + batch_size < len(texts):
            time.sleep(0.5)
    
    return embeddings
