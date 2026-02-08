import requests
import json

url = "http://127.0.0.1:8000/ingest"
payload = {
    "text": "This tests the Supabase ingestion.",
    "source": "Test"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    try:
        print(response.json())
    except:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
