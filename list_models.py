import google.generativeai as genai
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / 'backend/.env'
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("API Key not found")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
            if 'embedContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(e)
